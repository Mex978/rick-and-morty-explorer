import { HttpService } from '@nestjs/axios';
import { BadGatewayException, GatewayTimeoutException, NotFoundException } from '@nestjs/common';
import axios from 'axios';
import nock from 'nock';

import characters from '../../test/fixtures/characters.json';
import episode from '../../test/fixtures/episode.json';
import { RickAndMortyClient } from './rick-and-morty.client';

const baseUrl = 'https://rickandmortyapi.com/api';

describe('RickAndMortyClient', () => {
  const client = new RickAndMortyClient(new HttpService(axios.create({ baseURL: baseUrl, timeout: 100 })));

  beforeAll(() => nock.disableNetConnect());
  afterEach(() => nock.cleanAll());
  afterAll(() => nock.enableNetConnect());

  it('requests the episodes page as a query param', async () => {
    const scope = nock(baseUrl).get('/episode').query({ page: 2 }).reply(200, { info: {}, results: [] });

    await client.getEpisodes(2);

    expect(scope.isDone()).toBe(true);
  });

  it('fetches several characters in one request', async () => {
    const scope = nock(baseUrl).get('/character/1,2,35,38').reply(200, characters);

    const result = await client.getCharacters([1, 2, 35, 38]);

    expect(scope.isDone()).toBe(true);
    expect(result).toHaveLength(4);
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

  it('throws BadGatewayException on any other upstream failure', async () => {
    nock(baseUrl).get('/episode/1').reply(500);

    await expect(client.getEpisode(1)).rejects.toBeInstanceOf(BadGatewayException);
  });
});
