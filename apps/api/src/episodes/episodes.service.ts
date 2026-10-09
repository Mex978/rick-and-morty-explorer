import { Injectable, NotFoundException } from '@nestjs/common';
import type { Episode, EpisodeDetail, Paginated } from '@rma/types';

import { RickAndMortyClient } from '../rick-and-morty/rick-and-morty.client';
import type { RawEpisode, RawPaginated } from '../rick-and-morty/rick-and-morty.types';
import { characterIdsFrom, toCharacter, toEpisode, toPaginated } from './episodes.mapper';

// Pinned to one locale so the order does not depend on the ICU data of whatever machine runs the API.
const collator = new Intl.Collator('en');

const emptyPage: RawPaginated<RawEpisode> = {
  info: { count: 0, pages: 0, next: null, prev: null },
  results: [],
};

@Injectable()
export class EpisodesService {
  constructor(private readonly client: RickAndMortyClient) {}

  async list(page: number, name?: string): Promise<Paginated<Episode>> {
    try {
      return toPaginated(await this.client.getEpisodes(page, name), page, toEpisode);
    } catch (error) {
      if (isSearchWithoutMatches(error, name, page)) return toPaginated(emptyPage, page, toEpisode);
      throw error;
    }
  }

  async detail(id: number): Promise<EpisodeDetail> {
    const raw = await this.client.getEpisode(id);
    const rawCharacters = await this.client.getCharacters(characterIdsFrom(raw.characters));
    const characters = rawCharacters
      .map(toCharacter)
      .sort((a, b) => collator.compare(a.name, b.name));

    return { ...toEpisode(raw), characters };
  }
}

// The upstream answers a search with no matches with a 404; for the first page that is simply an empty list.
function isSearchWithoutMatches(error: unknown, name: string | undefined, page: number) {
  return Boolean(name) && page === 1 && error instanceof NotFoundException;
}
