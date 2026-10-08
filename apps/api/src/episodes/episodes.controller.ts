import { CacheInterceptor } from '@nestjs/cache-manager';
import { Controller, Get, Header, Param, ParseIntPipe, Query, UseInterceptors } from '@nestjs/common';
import type { Episode, EpisodeDetail, Paginated } from '@rma/types';
import { z } from 'zod';

import { ZodValidationPipe } from '../zod-validation.pipe';
import { EpisodesService } from './episodes.service';

const listQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  name: z.string().trim().max(100).optional(),
});

@Controller({ path: 'episodes', version: '1' })
@UseInterceptors(CacheInterceptor)
export class EpisodesController {
  constructor(private readonly episodes: EpisodesService) {}

  @Get()
  @Header('Cache-Control', 'public, max-age=3600')
  list(@Query(new ZodValidationPipe(listQuery)) { page, name }: z.infer<typeof listQuery>): Promise<Paginated<Episode>> {
    return this.episodes.list(page, name || undefined);
  }

  @Get(':id')
  @Header('Cache-Control', 'public, max-age=3600')
  detail(@Param('id', ParseIntPipe) id: number): Promise<EpisodeDetail> {
    return this.episodes.detail(id);
  }
}
