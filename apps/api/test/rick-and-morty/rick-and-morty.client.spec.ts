import { HttpService } from '@nestjs/axios';
import {
  BadGatewayException,
  GatewayTimeoutException,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import axios from 'axios';
import nock from 'nock';

import characters from '../fixtures/characters.json';
import episode from '../fixtures/episode.json';
import { MetricsService } from '../../src/observability/metrics.service';
import { RickAndMortyClient } from '../../src/rick-and-morty/rick-and-morty.client';
import { Semaphore } from '../../src/rick-and-morty/semaphore';

const baseUrl = 'https://rickandmortyapi.com/api';

describe('RickAndMortyClient', () => {
  const metrics = new MetricsService();
  const client = new RickAndMortyClient(
    new HttpService(axios.create({ baseURL: baseUrl, timeout: 100 })),
    metrics,
    new Semaphore(2),
  );

  beforeAll(() => nock.disableNetConnect());
  afterEach(() => nock.cleanAll());
  afterAll(() => nock.enableNetConnect());

  it('requests the episodes page as a query param', async () => {
    const scope = nock(baseUrl)
      .get('/episode')
      .query({ page: 2 })
      .reply(200, { info: {}, results: [] });

    await client.getEpisodes(2);

    expect(scope.isDone()).toBe(true);
  });

  it('filters episodes by name when one is given', async () => {
    const scope = nock(baseUrl)
      .get('/episode')
      .query({ page: 1, name: 'rick' })
      .reply(200, { info: {}, results: [] });

    await client.getEpisodes(1, 'rick');

    expect(scope.isDone()).toBe(true);
  });

  it('fetches several characters in one request', async () => {
    const scope = nock(baseUrl).get('/character/1,2,35,38').reply(200, characters);

    const result = await client.getCharacters([1, 2, 35, 38]);

    expect(scope.isDone()).toBe(true);
    expect(result).toHaveLength(4);
  });

  it('normalizes a single character response into an array', async () => {
    nock(baseUrl).get('/character/1').reply(200, characters[0]);

    const result = await client.getCharacters([1]);

    expect(result).toEqual([characters[0]]);
  });

  it('does not call the upstream when there are no ids', async () => {
    const result = await client.getCharacters([]);

    expect(result).toEqual([]);
  });

  it('throws NotFoundException when the upstream returns 404', async () => {
    nock(baseUrl).get('/episode/999').reply(404, { error: 'Episode not found' });

    await expect(client.getEpisode(999)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('throws GatewayTimeoutException when the upstream is too slow', async () => {
    nock(baseUrl).get('/episode/1').delay(500).reply(200, episode);

    await expect(client.getEpisode(1)).rejects.toBeInstanceOf(GatewayTimeoutException);
  });

  it('retries a transient upstream failure and succeeds on the next attempt', async () => {
    nock(baseUrl).get('/episode/1').reply(503);
    nock(baseUrl).get('/episode/1').reply(200, episode);

    await expect(client.getEpisode(1)).resolves.toMatchObject({ id: 1 });
    expect(nock.pendingMocks()).toEqual([]);
  });

  it('maps a rate limit to 503 without retrying', async () => {
    nock(baseUrl).get('/episode/1').times(2).reply(429, { error: 'Too many requests' });

    await expect(client.getEpisode(1)).rejects.toBeInstanceOf(ServiceUnavailableException);
    expect(nock.pendingMocks()).toHaveLength(1);
  });

  it('gives up after the retries are exhausted', async () => {
    nock(baseUrl).get('/episode/1').times(3).reply(503);

    await expect(client.getEpisode(1)).rejects.toBeInstanceOf(BadGatewayException);
    expect(nock.pendingMocks()).toEqual([]);
  });

  it('does not retry client errors', async () => {
    nock(baseUrl).get('/episode/999').times(2).reply(404, { error: 'Episode not found' });

    await expect(client.getEpisode(999)).rejects.toBeInstanceOf(NotFoundException);
    expect(nock.pendingMocks()).toHaveLength(1);
  });

  it('throws BadGatewayException on any other upstream failure, keeping the cause', async () => {
    nock(baseUrl).get('/episode/1').reply(500);

    const error = await client.getEpisode(1).then(
      () => new Error('expected a rejection'),
      (e: unknown) => e as Error,
    );

    expect(error).toBeInstanceOf(BadGatewayException);
    expect(error.cause).toMatchObject({ response: { status: 500 } });
  });

  it('keeps at most the configured number of upstream calls in flight and counts the ones that waited', async () => {
    let inFlight = 0;
    let peak = 0;
    nock(baseUrl)
      .get(/\/episode\/\d+/)
      .times(5)
      .reply(() => {
        inFlight += 1;
        peak = Math.max(peak, inFlight);
        return new Promise((resolve) =>
          setTimeout(() => ((inFlight -= 1), resolve([200, episode])), 20),
        );
      });

    await Promise.all([1, 2, 3, 4, 5].map((id) => client.getEpisode(id)));

    expect(peak).toBe(2);
    expect(await metrics.registry.metrics()).toContain('upstream_requests_queued_total 3');
  });
});
