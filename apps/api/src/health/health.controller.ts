import { Controller, Get, VERSION_NEUTRAL } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  HealthCheck,
  HealthCheckService,
  HttpHealthIndicator,
  MemoryHealthIndicator,
} from '@nestjs/terminus';
import type { HealthCheckResult } from '@nestjs/terminus';

import type { Env } from '../config/env';

const HEAP_LIMIT_BYTES = 512 * 1024 * 1024;

@Controller({ path: 'health', version: VERSION_NEUTRAL })
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly http: HttpHealthIndicator,
    private readonly memory: MemoryHealthIndicator,
    private readonly config: ConfigService<Env, true>,
  ) {}

  // Liveness: only this process. An upstream outage must not get a healthy container restarted.
  @Get()
  @HealthCheck()
  live(): Promise<HealthCheckResult> {
    return this.health.check([() => this.memory.checkHeap('memory_heap', HEAP_LIMIT_BYTES)]);
  }

  @Get('ready')
  @HealthCheck()
  ready(): Promise<HealthCheckResult> {
    return this.health.check([
      () => this.memory.checkHeap('memory_heap', HEAP_LIMIT_BYTES),
      () =>
        this.http.pingCheck('upstream', `${this.config.get('RICK_AND_MORTY_API_URL')}/episode/1`),
    ]);
  }
}
