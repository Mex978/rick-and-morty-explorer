import { HttpService } from '@nestjs/axios';
import { BadGatewayException, GatewayTimeoutException, NotFoundException } from '@nestjs/common';
import axios from 'axios';
import nock from 'nock';

import characters from '../../test/fixtures/characters.json';
import episode from '../../test/fixtures/episode.json';
import { MetricsService } from '../observability/metrics.service';
import { RickAndMortyClient } from './rick-and-morty.client';

const baseUrl = 'https://rickandmortyapi.com/api';

describe('RickAndMortyClient', () => {
  const client = new RickAndMortyClient(
    new HttpService(axios.create({ baseURL: baseUrl, timeout: 100 })),
    new MetricsService(),
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

  it('retries when the upstream rate limits and succeeds on the next attempt', async () => {
    nock(baseUrl).get('/episode/1').reply(429, { error: 'Too many requests' });
    nock(baseUrl).get('/episode/1').reply(200, episode);

    await expect(client.getEpisode(1)).resolves.toMatchObject({ id: 1 });
    expect(nock.pendingMocks()).toEqual([]);
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
});
