import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';

import { HealthController } from './health.controller';
import { ProcessState } from './process-state';

@Module({
  imports: [TerminusModule, HttpModule],
  controllers: [HealthController],
  providers: [ProcessState],
})
export class HealthModule {}
