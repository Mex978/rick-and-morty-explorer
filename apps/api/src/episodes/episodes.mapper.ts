import type { Episode, Paginated } from '@rma/types';

import type { RawEpisode, RawPaginated } from '../rick-and-morty/rick-and-morty.types';

export function toEpisode(raw: RawEpisode): Episode {
  return {
    id: raw.id,
    name: raw.name,
    airDate: raw.air_date,
    code: raw.episode,
    characterCount: raw.characters.length,
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
