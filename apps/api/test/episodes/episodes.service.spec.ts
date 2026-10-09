import { Test } from '@nestjs/testing';
import type { EpisodeDetail, Paginated, Episode } from '@rma/types';

import { EPISODE_SOURCE } from '../../src/episodes/episode-source';
import type { EpisodeSource } from '../../src/episodes/episode-source';
import { EpisodesService } from '../../src/episodes/episodes.service';

const pilot: Episode = {
  id: 1,
  name: 'Pilot',
  airDate: 'December 2, 2013',
  code: 'S01E01',
  characterCount: 3,
};
const character = (id: number, name: string) => ({
  id,
  name,
  status: 'Alive',
  species: 'Human',
  type: '',
  gender: 'Male',
  image: '',
  origin: 'Earth',
  location: 'Earth',
});

describe('EpisodesService', () => {
  let service: EpisodesService;
  const source: jest.Mocked<EpisodeSource> = {
    listEpisodes: jest.fn(),
    getEpisodeDetail: jest.fn(),
  };

  beforeEach(async () => {
    jest.resetAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [EpisodesService, { provide: EPISODE_SOURCE, useValue: source }],
    }).compile();

    service = moduleRef.get(EpisodesService);
  });

  it('lists the requested page through the source, filter included', async () => {
    const page: Paginated<Episode> = {
      info: { count: 1, pages: 1, currentPage: 2, hasNext: false, hasPrev: true },
      results: [pilot],
    };
    source.listEpisodes.mockResolvedValue(page);

    await expect(service.list(2, 'pilot')).resolves.toBe(page);

    expect(source.listEpisodes).toHaveBeenCalledWith(2, 'pilot');
  });

  it('returns the detail with characters sorted by name, whatever order the source keeps', async () => {
    const detail: EpisodeDetail = {
      ...pilot,
      characters: [
        character(1, 'Rick Sanchez'),
        character(38, 'Beth Smith'),
        character(2, 'Morty Smith'),
        character(35, 'Bepisian'),
      ],
    };
    source.getEpisodeDetail.mockResolvedValue(detail);

    const result = await service.detail(1);

    expect(source.getEpisodeDetail).toHaveBeenCalledWith(1);
    expect(result.characters.map((c) => c.name)).toEqual([
      'Bepisian',
      'Beth Smith',
      'Morty Smith',
      'Rick Sanchez',
    ]);
    expect(detail.characters[0].name).toBe('Rick Sanchez');
  });
});
