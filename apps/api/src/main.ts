import { ConsoleLogger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { setupApp } from './app.setup';
import type { Env } from './config/env';

async function bootstrap() {
  const app = setupApp(
    await NestFactory.create(AppModule, {
      logger: new ConsoleLogger({ json: process.env.NODE_ENV === 'production' }),
    }),
  );
  const config = app.get(ConfigService<Env, true>);

  // SIGTERM runs the shutdown hooks, so readiness turns down and the drain happens before the server closes.
  app.enableShutdownHooks();
  await app.listen(config.get('PORT'));
}

void bootstrap();
