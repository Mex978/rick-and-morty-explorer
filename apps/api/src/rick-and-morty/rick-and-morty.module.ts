import http from 'node:http';
import https from 'node:https';

import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import type { Env } from '../config/env';
import { RickAndMortyClient } from './rick-and-morty.client';

@Module({
  imports: [
    HttpModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>) => ({
        baseURL: config.get('RICK_AND_MORTY_API_URL'),
        timeout: 5000,
        httpAgent: new http.Agent({ keepAlive: true }),
        httpsAgent: new https.Agent({ keepAlive: true }),
      }),
    }),
  ],
  providers: [RickAndMortyClient],
  exports: [RickAndMortyClient],
})
export class RickAndMortyModule {}
