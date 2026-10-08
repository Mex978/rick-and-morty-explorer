import { Module } from '@nestjs/common';

import { RickAndMortyModule } from '../rick-and-morty/rick-and-morty.module';
import { EpisodesController } from './episodes.controller';
import { EpisodesService } from './episodes.service';

@Module({
  imports: [RickAndMortyModule],
  controllers: [EpisodesController],
  providers: [EpisodesService],
})
export class EpisodesModule {}
