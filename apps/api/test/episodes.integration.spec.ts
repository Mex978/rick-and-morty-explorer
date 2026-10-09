import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import nock from 'nock';
import request from 'supertest';

import { AppModule } from '../src/app.module';
import { setupApp } from '../src/app.setup';
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

beforeEach(async () => {
  const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
  app = setupApp(moduleRef.createNestApplication());
  await app.init();
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

  it('reports ready when the upstream answers', async () => {
    nock(upstream).get('/episode/1').reply(200, episode);

    const response = await request(app.getHttpServer()).get('/health/ready').expect(200);

    expect(Object.keys(response.body.info)).toEqual(['memory_heap', 'upstream']);
  });

  it('reports not ready when the upstream is down', async () => {
    nock(upstream).get('/episode/1').reply(503);

    const response = await request(app.getHttpServer()).get('/health/ready').expect(503);

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
