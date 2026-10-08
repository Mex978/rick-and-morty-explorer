import { Controller, DefaultValuePipe, Get, ParseIntPipe, Query } from '@nestjs/common';
import type { Episode, Paginated } from '@rma/types';

import { EpisodesService } from './episodes.service';

@Controller({ path: 'episodes', version: '1' })
export class EpisodesController {
  constructor(private readonly episodes: EpisodesService) {}

  @Get()
  list(@Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number): Promise<Paginated<Episode>> {
    return this.episodes.list(page);
  }
}
