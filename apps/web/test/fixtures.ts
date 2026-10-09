import type { Character, Episode, EpisodeDetail, Paginated } from '@rma/types';

export const episodes: Episode[] = [
  { id: 1, name: 'Pilot', airDate: 'December 2, 2013', code: 'S01E01', characterCount: 19 },
  { id: 2, name: 'Lawnmower Dog', airDate: 'December 9, 2013', code: 'S01E02', characterCount: 1 },
  {
    id: 12,
    name: 'A Rickle in Time',
    airDate: 'July 26, 2015',
    code: 'S02E01',
    characterCount: 24,
  },
];

export function episodesPage(
  overrides: Partial<Paginated<Episode>['info']> = {},
): Paginated<Episode> {
  return {
    info: { count: 51, pages: 3, currentPage: 1, hasNext: true, hasPrev: false, ...overrides },
    results: episodes,
  };
}

export const characters: Character[] = [
  {
    id: 35,
    name: 'Bepisian',
    status: 'Alive',
    species: 'Alien',
    type: 'Bepisian',
    gender: 'unknown',
    image: 'https://rickandmortyapi.com/api/character/avatar/35.jpeg',
    origin: 'Bepis 9',
    location: 'Bepis 9',
  },
  {
    id: 38,
    name: 'Beth Smith',
    status: 'Dead',
    species: 'Human',
    type: '',
    gender: 'Female',
    image: 'https://rickandmortyapi.com/api/character/avatar/38.jpeg',
    origin: 'Earth (C-137)',
    location: 'Earth (C-137)',
  },
  {
    id: 1,
    name: 'Rick Sanchez',
    status: 'unknown',
    species: 'Human',
    type: '',
    gender: 'Male',
    image: 'https://rickandmortyapi.com/api/character/avatar/1.jpeg',
    origin: 'Earth (C-137)',
    location: 'Citadel of Ricks',
  },
];

export const episodeDetail: EpisodeDetail = { ...episodes[0], characterCount: 3, characters };
