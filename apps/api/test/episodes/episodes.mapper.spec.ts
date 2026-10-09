import type { RawCharacter, RawEpisode } from '../../src/rick-and-morty/rick-and-morty.types';
import characters from '../fixtures/characters.json';
import episode from '../fixtures/episode.json';
import episodes from '../fixtures/episodes.json';
import {
  characterIdsFrom,
  toCharacter,
  toEpisode,
  toPaginated,
} from '../../src/episodes/episodes.mapper';

describe('episodes mapper', () => {
  it('maps a raw episode to the public contract', () => {
    expect(toEpisode(episode)).toEqual({
      id: 1,
      name: 'Pilot',
      airDate: 'December 2, 2013',
      code: 'S01E01',
      characterCount: 4,
    });
  });

  it('flattens origin and location to their names', () => {
    const rick = characters[0] as RawCharacter;

    expect(toCharacter(rick)).toEqual({
      id: 1,
      name: 'Rick Sanchez',
      status: 'Alive',
      species: 'Human',
      type: '',
      gender: 'Male',
      image: 'https://rickandmortyapi.com/api/character/avatar/1.jpeg',
      origin: 'Earth (C-137)',
      location: 'Citadel of Ricks',
    });
  });

  it('extracts character ids from upstream urls', () => {
    expect(characterIdsFrom(episode.characters)).toEqual([1, 2, 35, 38]);
  });

  it('drops urls that do not end in a positive id instead of asking the upstream for them', () => {
    expect(
      characterIdsFrom([
        'https://rickandmortyapi.com/api/character/1',
        'https://rickandmortyapi.com/api/character/',
        'https://rickandmortyapi.com/api/character/abc',
        'https://rickandmortyapi.com/api/character/0',
      ]),
    ).toEqual([1]);
  });

  it('maps pagination links to flags', () => {
    const page = toPaginated(episodes, 1, (raw: RawEpisode) => raw.id);

    expect(page.info).toEqual({
      count: 51,
      pages: 3,
      currentPage: 1,
      hasNext: true,
      hasPrev: false,
    });
    expect(page.results).toEqual([1, 2]);
  });
});
