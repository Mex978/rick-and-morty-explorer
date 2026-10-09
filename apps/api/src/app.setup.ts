import { VersioningType } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import type { Env } from './config/env';

export function setupApp(app: INestApplication): INestApplication {
  const config = app.get(ConfigService<Env, true>);

  app.setGlobalPrefix('api', { exclude: ['health', 'health/ready', 'health/upstream', 'metrics'] });
  app.enableVersioning({ type: VersioningType.URI });
  // Lets express take the client ip from X-Forwarded-For, which the throttler keys on.
  app.getHttpAdapter().getInstance().set('trust proxy', config.get('TRUST_PROXY_HOPS'));
  return app;
}
