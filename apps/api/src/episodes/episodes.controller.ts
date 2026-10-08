import { Controller, DefaultValuePipe, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import type { Episode, EpisodeDetail, Paginated } from '@rma/types';

import { EpisodesService } from './episodes.service';

@Controller({ path: 'episodes', version: '1' })
export class EpisodesController {
  constructor(private readonly episodes: EpisodesService) {}

  @Get()
  list(@Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number): Promise<Paginated<Episode>> {
    return this.episodes.list(page);
  }

  @Get(':id')
  detail(@Param('id', ParseIntPipe) id: number): Promise<EpisodeDetail> {
    return this.episodes.detail(id);
  }
}
