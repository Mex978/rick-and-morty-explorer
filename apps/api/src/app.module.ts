import { CacheableMemory } from '@cacheable/memory';
import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import Keyv from 'keyv';

import { validateEnv } from './config/env';
import type { Env } from './config/env';
import { EpisodesModule } from './episodes/episodes.module';
import { HealthModule } from './health/health.module';
import { ObservabilityModule } from './observability/observability.module';

// Cache keys are request urls, which carry user input, so the store is bounded.
const MAX_CACHED_RESPONSES = 500;
const THROTTLE_WINDOW_MS = 60_000;

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>) => {
        const ttl = config.get('CACHE_TTL_SECONDS') * 1000;
        return {
          ttl,
          stores: [
            new Keyv({ store: new CacheableMemory({ ttl, lruSize: MAX_CACHED_RESPONSES }) }),
          ],
        };
      },
    }),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>) => ({
        throttlers: [{ ttl: THROTTLE_WINDOW_MS, limit: config.get('THROTTLE_LIMIT') }],
      }),
    }),
    ObservabilityModule,
    HealthModule,
    EpisodesModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
