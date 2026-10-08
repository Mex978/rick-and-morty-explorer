import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { validateEnv } from './config/env';
import type { Env } from './config/env';
import { EpisodesModule } from './episodes/episodes.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>) => ({
        ttl: config.get('CACHE_TTL_SECONDS') * 1000,
      }),
    }),
    EpisodesModule,
  ],
})
export class AppModule {}
