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
    const raw = await this.client.getEpisodes(page, name).catch((error: unknown) => {
      // A search with no matches is a 404 upstream but an empty first page for us; later pages stay 404.
      if (name && page === 1 && error instanceof NotFoundException) return emptyPage;
      throw error;
    });

    return toPaginated(raw, page, toEpisode);
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
