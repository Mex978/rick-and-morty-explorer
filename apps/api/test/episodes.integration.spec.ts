import type { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import nock from 'nock';
import request from 'supertest';

import { AppModule } from '../src/app.module';
import { setupApp } from '../src/app.setup';
import { validateEnv } from '../src/config/env';
import type { Env } from '../src/config/env';
import { ProcessState } from '../src/health/process-state';
import characters from './fixtures/characters.json';
import episode from './fixtures/episode.json';
import episodes from './fixtures/episodes.json';

const upstream = 'https://rickandmortyapi.com/api';

let app: INestApplication;

beforeAll(() => {
  nock.disableNetConnect();
  nock.enableNetConnect('127.0.0.1');
});
afterAll(() => nock.enableNetConnect());

// The real module reads process.env once at import time, so suites that need another
// configuration swap the ConfigService for one answering with the defaults plus their overrides.
async function createApp(overrides: Partial<Env> = {}): Promise<INestApplication> {
  const env = { ...validateEnv({}), ...overrides };
  const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
    .overrideProvider(ConfigService)
    .useValue({ get: (key: keyof Env) => env[key] })
    .compile();
  const created = setupApp(moduleRef.createNestApplication());
  await created.init();
  return created;
}

beforeEach(async () => {
  app = await createApp();
});

afterEach(async () => {
  nock.cleanAll();
  await app.close();
});

describe('GET /api/v1/episodes', () => {
  it('lists episodes with pagination info', async () => {
    nock(upstream).get('/episode').query({ page: 1 }).reply(200, episodes);

    const response = await request(app.getHttpServer()).get('/api/v1/episodes').expect(200);

    expect(response.headers['cache-control']).toBe('public, max-age=3600');
    expect(response.body.info).toEqual({
      count: 51,
      pages: 3,
      currentPage: 1,
      hasNext: true,
      hasPrev: false,
    });
    expect(response.body.results[0]).toEqual({
      id: 1,
      name: 'Pilot',
      airDate: 'December 2, 2013',
      code: 'S01E01',
      characterCount: 2,
    });
  });

  it('filters episodes by name and answers an empty page when nothing matches', async () => {
    nock(upstream).get('/episode').query({ page: 1, name: 'pilot' }).reply(200, episodes);
    nock(upstream)
      .get('/episode')
      .query({ page: 1, name: 'nothing' })
      .reply(404, { error: 'There is nothing here' });

    const found = await request(app.getHttpServer()).get('/api/v1/episodes?name=pilot').expect(200);
    const empty = await request(app.getHttpServer())
      .get('/api/v1/episodes?name=nothing')
      .expect(200);

    nock(upstream)
      .get('/episode')
      .query({ page: 2, name: 'pilot' })
      .reply(404, { error: 'There is nothing here' });
    await request(app.getHttpServer()).get('/api/v1/episodes?name=pilot&page=2').expect(404);

    expect(found.body.results).toHaveLength(2);
    expect(empty.body).toEqual({
      info: { count: 0, pages: 0, currentPage: 1, hasNext: false, hasPrev: false },
      results: [],
    });
  });

  it.each([
    'page=abc',
    'page=0',
    'page=-1',
    'page=1.5',
    'name=a&name=b',
    `name=${'x'.repeat(101)}`,
  ])('returns 400 for the invalid query %s', async (query) => {
    await request(app.getHttpServer()).get(`/api/v1/episodes?${query}`).expect(400);
  });

  it.each(['abc', '0', '-1', '1.5'])('returns 400 for the invalid id %s', async (id) => {
    await request(app.getHttpServer()).get(`/api/v1/episodes/${id}`).expect(400);
  });

  it('does not mark error responses as cacheable', async () => {
    nock(upstream).get('/episode/999').reply(404, { error: 'Episode not found' });

    const badRequest = await request(app.getHttpServer())
      .get('/api/v1/episodes?page=abc')
      .expect(400);
    const notFound = await request(app.getHttpServer()).get('/api/v1/episodes/999').expect(404);

    expect(badRequest.headers['cache-control']).toBeUndefined();
    expect(notFound.headers['cache-control']).toBeUndefined();
  });

  it('returns the episode with characters sorted by name', async () => {
    nock(upstream).get('/episode/1').reply(200, episode);
    nock(upstream).get('/character/1,2,35,38').reply(200, characters);

    const response = await request(app.getHttpServer()).get('/api/v1/episodes/1').expect(200);

    expect(response.body.code).toBe('S01E01');
    expect(response.body.characters.map((c: { name: string }) => c.name)).toEqual([
      'Bepisian',
      'Beth Smith',
      'Morty Smith',
      'Rick Sanchez',
    ]);
  });

  it('returns 404 when the episode does not exist', async () => {
    nock(upstream).get('/episode/999').reply(404, { error: 'Episode not found' });

    await request(app.getHttpServer()).get('/api/v1/episodes/999').expect(404);
  });

  it('tags every response with a request id, reusing the one sent by the caller', async () => {
    nock(upstream).get('/episode').query({ page: 1 }).reply(200, episodes);

    const generated = await request(app.getHttpServer()).get('/api/v1/episodes').expect(200);
    const forwarded = await request(app.getHttpServer())
      .get('/api/v1/episodes')
      .set('x-request-id', 'abc-123')
      .expect(200);

    const rejected = await request(app.getHttpServer())
      .get('/api/v1/episodes')
      .set('x-request-id', 'not valid <script>')
      .expect(200);

    expect(generated.headers['x-request-id']).toMatch(/^[0-9a-f-]{36}$/);
    expect(forwarded.headers['x-request-id']).toBe('abc-123');
    expect(rejected.headers['x-request-id']).toMatch(/^[0-9a-f-]{36}$/);
  });

  it('serves repeated requests from cache without hitting the upstream', async () => {
    const scope = nock(upstream).get('/episode').query({ page: 2 }).once().reply(200, episodes);

    await request(app.getHttpServer()).get('/api/v1/episodes?page=2').expect(200);
    const second = await request(app.getHttpServer()).get('/api/v1/episodes?page=2').expect(200);

    expect(scope.isDone()).toBe(true);
    expect(nock.pendingMocks()).toEqual([]);
    expect(second.body.results).toHaveLength(2);
    expect(second.headers['x-cache']).toBe('HIT');
    expect(second.headers['cache-control']).toBe('public, max-age=3600');
  });
});

describe('operational endpoints', () => {
  it('reports the process alive without touching the upstream', async () => {
    const response = await request(app.getHttpServer()).get('/health').expect(200);

    expect(response.body.status).toBe('ok');
    expect(Object.keys(response.body.info)).toEqual(['memory_heap']);
  });

  it('reports ready without touching the upstream', async () => {
    const response = await request(app.getHttpServer()).get('/health/ready').expect(200);

    expect(Object.keys(response.body.info)).toEqual(['memory_heap', 'process']);
    expect(nock.pendingMocks()).toEqual([]);
  });

  it('reports not ready once the shutdown started, while still serving', async () => {
    await app.get(ProcessState).beforeApplicationShutdown();

    const ready = await request(app.getHttpServer()).get('/health/ready').expect(503);
    await request(app.getHttpServer()).get('/health').expect(200);

    expect(ready.body.error.process).toEqual({ status: 'down', message: 'shutting down' });
  });

  it('reports the upstream up when it answers', async () => {
    nock(upstream).get('/episode/1').reply(200, episode);

    const response = await request(app.getHttpServer()).get('/health/upstream').expect(200);

    expect(Object.keys(response.body.info)).toEqual(['upstream']);
  });

  it('reports the upstream down when it fails', async () => {
    nock(upstream).get('/episode/1').reply(503);

    const response = await request(app.getHttpServer()).get('/health/upstream').expect(503);

    expect(response.body.error.upstream.status).toBe('down');
  });

  it('counts unmatched routes under a single label instead of their raw url', async () => {
    await request(app.getHttpServer()).get('/api/v1/nope/12345').expect(404);

    const response = await request(app.getHttpServer()).get('/metrics').expect(200);

    expect(response.text).toContain(
      'http_request_duration_seconds_count{method="GET",route="unmatched",status="404"} 1',
    );
    expect(response.text).not.toContain('nope');
  });

  it('exposes prometheus metrics for handled requests, cache and upstream calls', async () => {
    nock(upstream).get('/episode').query({ page: 1 }).once().reply(200, episodes);
    await request(app.getHttpServer()).get('/api/v1/episodes').expect(200);
    await request(app.getHttpServer()).get('/api/v1/episodes').expect(200);

    const response = await request(app.getHttpServer()).get('/metrics').expect(200);

    expect(response.headers['content-type']).toContain('text/plain');
    expect(response.text).toContain(
      'http_request_duration_seconds_count{method="GET",route="/api/v1/episodes",status="200"} 2',
    );
    expect(response.text).toContain('cache_events_total{result="miss"} 1');
    expect(response.text).toContain('cache_events_total{result="hit"} 1');
    expect(response.text).toContain(
      'upstream_request_duration_seconds_count{operation="getEpisodes",status="200"} 1',
    );
  });
});

describe('rate limiting', () => {
  let limited: INestApplication;

  afterEach(() => limited.close());

  it('answers 429 with a retry hint once a client exceeds the limit, leaving probes alone', async () => {
    limited = await createApp({ THROTTLE_LIMIT: 2 });
    nock(upstream).get('/episode').query({ page: 1 }).reply(200, episodes);

    await request(limited.getHttpServer()).get('/api/v1/episodes').expect(200);
    await request(limited.getHttpServer()).get('/api/v1/episodes').expect(200);
    const rejected = await request(limited.getHttpServer()).get('/api/v1/episodes').expect(429);

    expect(rejected.headers['retry-after']).toMatch(/^\d+$/);
    expect(rejected.headers['cache-control']).toBeUndefined();
    for (const path of ['/health', '/health/ready', '/metrics']) {
      await request(limited.getHttpServer()).get(path).expect(200);
    }
  });

  it('keys the limit on the forwarded ip only when a proxy is trusted', async () => {
    limited = await createApp({ THROTTLE_LIMIT: 1, TRUST_PROXY_HOPS: 1 });
    nock(upstream).get('/episode').query({ page: 1 }).reply(200, episodes);

    await request(limited.getHttpServer())
      .get('/api/v1/episodes')
      .set('x-forwarded-for', '10.0.0.1')
      .expect(200);
    await request(limited.getHttpServer())
      .get('/api/v1/episodes')
      .set('x-forwarded-for', '10.0.0.2')
      .expect(200);
    await request(limited.getHttpServer())
      .get('/api/v1/episodes')
      .set('x-forwarded-for', '10.0.0.1')
      .expect(429);
  });

  it('ignores a forwarded ip when no proxy is trusted, so it cannot be spoofed around', async () => {
    limited = await createApp({ THROTTLE_LIMIT: 1 });
    nock(upstream).get('/episode').query({ page: 1 }).reply(200, episodes);

    await request(limited.getHttpServer())
      .get('/api/v1/episodes')
      .set('x-forwarded-for', '10.0.0.1')
      .expect(200);
    await request(limited.getHttpServer())
      .get('/api/v1/episodes')
      .set('x-forwarded-for', '10.0.0.2')
      .expect(429);
  });
});
