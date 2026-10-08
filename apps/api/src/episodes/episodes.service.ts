import { Injectable } from '@nestjs/common';
import type { Episode, Paginated } from '@rma/types';

import { RickAndMortyClient } from '../rick-and-morty/rick-and-morty.client';
import { toEpisode, toPaginated } from './episodes.mapper';

@Injectable()
export class EpisodesService {
  constructor(private readonly client: RickAndMortyClient) {}

  async list(page: number): Promise<Paginated<Episode>> {
    const raw = await this.client.getEpisodes(page);
    return toPaginated(raw, page, toEpisode);
  }
}
