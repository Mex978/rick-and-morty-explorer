import { Inject, Injectable } from '@nestjs/common';
import type { Episode, EpisodeDetail, Paginated } from '@rma/types';

import { EPISODE_SOURCE } from './episode-source';
import type { EpisodeSource } from './episode-source';

// Pinned so the order does not depend on the ICU data of the machine running the API.
const collator = new Intl.Collator('en');

@Injectable()
export class EpisodesService {
  constructor(@Inject(EPISODE_SOURCE) private readonly source: EpisodeSource) {}

  list(page: number, name?: string): Promise<Paginated<Episode>> {
    return this.source.listEpisodes(page, name);
  }

  async detail(id: number): Promise<EpisodeDetail> {
    const detail = await this.source.getEpisodeDetail(id);
    const characters = [...detail.characters].sort((a, b) => collator.compare(a.name, b.name));

    return { ...detail, characters };
  }
}
