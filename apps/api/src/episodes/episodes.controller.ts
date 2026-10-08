import { CacheInterceptor } from '@nestjs/cache-manager';
import {
  Controller,
  DefaultValuePipe,
  Get,
  Header,
  Param,
  ParseIntPipe,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import type { Episode, EpisodeDetail, Paginated } from '@rma/types';

import { EpisodesService } from './episodes.service';

@Controller({ path: 'episodes', version: '1' })
@UseInterceptors(CacheInterceptor)
export class EpisodesController {
  constructor(private readonly episodes: EpisodesService) {}

  @Get()
  @Header('Cache-Control', 'public, max-age=3600')
  list(@Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number): Promise<Paginated<Episode>> {
    return this.episodes.list(page);
  }

  @Get(':id')
  @Header('Cache-Control', 'public, max-age=3600')
  detail(@Param('id', ParseIntPipe) id: number): Promise<EpisodeDetail> {
    return this.episodes.detail(id);
  }
}
