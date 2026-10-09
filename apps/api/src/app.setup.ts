import { VersioningType } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';

export function setupApp(app: INestApplication): INestApplication {
  app.setGlobalPrefix('api', { exclude: ['health', 'health/ready', 'health/upstream', 'metrics'] });
  app.enableVersioning({ type: VersioningType.URI });
  return app;
}
