import { Test } from '@nestjs/testing';

import { RickAndMortyClient } from '../rick-and-morty/rick-and-morty.client';
import characters from '../../test/fixtures/characters.json';
import episode from '../../test/fixtures/episode.json';
import episodes from '../../test/fixtures/episodes.json';
import { EpisodesService } from './episodes.service';

describe('EpisodesService', () => {
  let service: EpisodesService;
  const client = {
    getEpisodes: jest.fn(),
    getEpisode: jest.fn(),
    getCharacters: jest.fn(),
  };

  beforeEach(async () => {
    jest.resetAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [EpisodesService, { provide: RickAndMortyClient, useValue: client }],
    }).compile();

    service = moduleRef.get(EpisodesService);
  });

  it('lists episodes for the requested page', async () => {
    client.getEpisodes.mockResolvedValue(episodes);

    const page = await service.list(1);

    expect(client.getEpisodes).toHaveBeenCalledWith(1);
    expect(page.info.currentPage).toBe(1);
    expect(page.results.map((e) => e.code)).toEqual(['S01E01', 'S01E02']);
  });

  it('fetches all characters of an episode in a single batch', async () => {
    client.getEpisode.mockResolvedValue(episode);
    client.getCharacters.mockResolvedValue(characters);

    await service.detail(1);

    expect(client.getCharacters).toHaveBeenCalledTimes(1);
    expect(client.getCharacters).toHaveBeenCalledWith([1, 2, 35, 38]);
  });

  it('returns characters sorted by name', async () => {
    client.getEpisode.mockResolvedValue(episode);
    client.getCharacters.mockResolvedValue(characters);

    const detail = await service.detail(1);

    expect(detail.characterCount).toBe(4);
    expect(detail.characters.map((c) => c.name)).toEqual([
      'Bepisian',
      'Beth Smith',
      'Morty Smith',
      'Rick Sanchez',
    ]);
  });
});
