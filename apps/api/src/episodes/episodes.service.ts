import { Injectable } from '@nestjs/common';
import type { Episode, EpisodeDetail, Paginated } from '@rma/types';

import { RickAndMortyClient } from '../rick-and-morty/rick-and-morty.client';
import { characterIdsFrom, toCharacter, toEpisode, toPaginated } from './episodes.mapper';

@Injectable()
export class EpisodesService {
  constructor(private readonly client: RickAndMortyClient) {}

  async list(page: number): Promise<Paginated<Episode>> {
    const raw = await this.client.getEpisodes(page);
    return toPaginated(raw, page, toEpisode);
  }

  async detail(id: number): Promise<EpisodeDetail> {
    const raw = await this.client.getEpisode(id);
    const rawCharacters = await this.client.getCharacters(characterIdsFrom(raw.characters));
    const characters = rawCharacters.map(toCharacter).sort((a, b) => a.name.localeCompare(b.name));

    return { ...toEpisode(raw), characters };
  }
}
