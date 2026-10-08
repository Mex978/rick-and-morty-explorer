import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { setupApp } from './app.setup';
import type { Env } from './config/env';

async function bootstrap() {
  const app = setupApp(await NestFactory.create(AppModule));
  const config = app.get(ConfigService<Env, true>);

  await app.listen(config.get('PORT'));
}

void bootstrap();
