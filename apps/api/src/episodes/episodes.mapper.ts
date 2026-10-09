import type { Character, Episode, Paginated } from '@rma/types';

import type {
  RawCharacter,
  RawEpisode,
  RawPaginated,
} from '../rick-and-morty/rick-and-morty.types';

export function toEpisode(raw: RawEpisode): Episode {
  return {
    id: raw.id,
    name: raw.name,
    airDate: raw.air_date,
    code: raw.episode,
    characterCount: raw.characters.length,
  };
}

export function toCharacter(raw: RawCharacter): Character {
  return {
    id: raw.id,
    name: raw.name,
    status: raw.status,
    species: raw.species,
    type: raw.type,
    gender: raw.gender,
    image: raw.image,
    origin: raw.origin.name,
    location: raw.location.name,
  };
}

export function toPaginated<TRaw, T>(
  raw: RawPaginated<TRaw>,
  currentPage: number,
  mapItem: (item: TRaw) => T,
): Paginated<T> {
  return {
    info: {
      count: raw.info.count,
      pages: raw.info.pages,
      currentPage,
      hasNext: raw.info.next !== null,
      hasPrev: raw.info.prev !== null,
    },
    results: raw.results.map(mapItem),
  };
}

export function characterIdsFrom(urls: string[]): number[] {
  return urls.map((url) => Number(url.slice(url.lastIndexOf('/') + 1)));
}
