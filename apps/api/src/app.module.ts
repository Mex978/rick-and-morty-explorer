import { CacheableMemory } from '@cacheable/memory';
import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Keyv from 'keyv';

import { validateEnv } from './config/env';
import type { Env } from './config/env';
import { EpisodesModule } from './episodes/episodes.module';

// Cache keys are request urls, which include user input (?name=), so the store has to be bounded.
const MAX_CACHED_RESPONSES = 500;

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>) => {
        const ttl = config.get('CACHE_TTL_SECONDS') * 1000;
        return { ttl, stores: [new Keyv({ store: new CacheableMemory({ ttl, lruSize: MAX_CACHED_RESPONSES }) })] };
      },
    }),
    EpisodesModule,
  ],
})
export class AppModule {}
