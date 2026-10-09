import { NotFoundException } from '@nestjs/common';

import { RickAndMortyClient } from '../../src/rick-and-morty/rick-and-morty.client';
import { RickAndMortyEpisodeSource } from '../../src/rick-and-morty/rick-and-morty.episode-source';
import characters from '../fixtures/characters.json';
import episode from '../fixtures/episode.json';
import episodes from '../fixtures/episodes.json';

describe('RickAndMortyEpisodeSource', () => {
  const client = {
    getEpisodes: jest.fn(),
    getEpisode: jest.fn(),
    getCharacters: jest.fn(),
  };
  const source = new RickAndMortyEpisodeSource(client as unknown as RickAndMortyClient);

  beforeEach(() => jest.resetAllMocks());

  it('maps a page of episodes to the public contract', async () => {
    client.getEpisodes.mockResolvedValue(episodes);

    const page = await source.listEpisodes(1);

    expect(client.getEpisodes).toHaveBeenCalledWith(1, undefined);
    expect(page.info).toEqual({
      count: 51,
      pages: 3,
      currentPage: 1,
      hasNext: true,
      hasPrev: false,
    });
    expect(page.results.map((e) => e.code)).toEqual(['S01E01', 'S01E02']);
  });

  it('forwards the name filter', async () => {
    client.getEpisodes.mockResolvedValue(episodes);

    await source.listEpisodes(2, 'rick');

    expect(client.getEpisodes).toHaveBeenCalledWith(2, 'rick');
  });

  it('turns the upstream 404 for a search without matches into an empty first page', async () => {
    client.getEpisodes.mockRejectedValue(new NotFoundException());

    await expect(source.listEpisodes(1, 'nothing')).resolves.toEqual({
      info: { count: 0, pages: 0, currentPage: 1, hasNext: false, hasPrev: false },
      results: [],
    });
  });

  it.each([
    ['a search page past the last one', 2, 'rick'],
    ['a page that does not exist', 99, undefined],
  ])('keeps the 404 for %s', async (_, page, name) => {
    client.getEpisodes.mockRejectedValue(new NotFoundException());

    await expect(source.listEpisodes(page, name)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('fetches the characters of an episode in one batch and maps them, order untouched', async () => {
    client.getEpisode.mockResolvedValue(episode);
    client.getCharacters.mockResolvedValue(characters);

    const detail = await source.getEpisodeDetail(1);

    expect(client.getCharacters).toHaveBeenCalledTimes(1);
    expect(client.getCharacters).toHaveBeenCalledWith([1, 2, 35, 38]);
    expect(detail.code).toBe('S01E01');
    expect(detail.characterCount).toBe(4);
    expect(detail.characters.map((c) => c.name)).toEqual(
      characters.map((c: { name: string }) => c.name),
    );
  });
});
