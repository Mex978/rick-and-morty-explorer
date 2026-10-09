import { Injectable, NotFoundException } from '@nestjs/common';
import type { Episode, EpisodeDetail, Paginated } from '@rma/types';

import type { EpisodeSource } from '../episodes/episode-source';
import { RickAndMortyClient } from './rick-and-morty.client';
import { characterIdsFrom, toCharacter, toEpisode, toPaginated } from './rick-and-morty.mapper';
import type { RawEpisode, RawPaginated } from './rick-and-morty.types';

const emptyPage: RawPaginated<RawEpisode> = {
  info: { count: 0, pages: 0, next: null, prev: null },
  results: [],
};

// Adapts the upstream to the EpisodeSource port: its pagination, its character urls, its 404s.
@Injectable()
export class RickAndMortyEpisodeSource implements EpisodeSource {
  constructor(private readonly client: RickAndMortyClient) {}

  async listEpisodes(page: number, name?: string): Promise<Paginated<Episode>> {
    try {
      return toPaginated(await this.client.getEpisodes(page, name), page, toEpisode);
    } catch (error) {
      if (isSearchWithoutMatches(error, name, page)) return toPaginated(emptyPage, page, toEpisode);
      throw error;
    }
  }

  // The upstream lists character urls on an episode; one batch request turns them into characters.
  async getEpisodeDetail(id: number): Promise<EpisodeDetail> {
    const raw = await this.client.getEpisode(id);
    const characters = await this.client.getCharacters(characterIdsFrom(raw.characters));

    return { ...toEpisode(raw), characters: characters.map(toCharacter) };
  }
}

// The upstream answers a search without matches with a 404.
function isSearchWithoutMatches(error: unknown, name: string | undefined, page: number) {
  return Boolean(name) && page === 1 && error instanceof NotFoundException;
}
