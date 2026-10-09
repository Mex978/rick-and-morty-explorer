import { Controller, Get, VERSION_NEUTRAL } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  HealthCheck,
  HealthCheckService,
  HealthIndicatorService,
  HttpHealthIndicator,
  MemoryHealthIndicator,
} from '@nestjs/terminus';
import type { HealthCheckResult } from '@nestjs/terminus';
import { SkipThrottle } from '@nestjs/throttler';

import type { Env } from '../config/env';
import { ProcessState } from './process-state';

const HEAP_LIMIT_BYTES = 512 * 1024 * 1024;
const UPSTREAM_TIMEOUT_MS = 2000;

// Liveness and readiness look only at this process: an upstream outage must neither restart a
// healthy container nor pull every instance out of rotation while the cache can still answer.
// The upstream has its own endpoint, for dashboards and alerts, never for gating traffic.
@SkipThrottle()
@Controller({ path: 'health', version: VERSION_NEUTRAL })
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly indicator: HealthIndicatorService,
    private readonly http: HttpHealthIndicator,
    private readonly memory: MemoryHealthIndicator,
    private readonly process: ProcessState,
    private readonly config: ConfigService<Env, true>,
  ) {}

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
      () => {
        const session = this.indicator.check('process');
        return this.process.isShuttingDown ? session.down('shutting down') : session.up();
      },
    ]);
  }

  @Get('upstream')
  @HealthCheck()
  upstream(): Promise<HealthCheckResult> {
    return this.health.check([
      () =>
        this.http.pingCheck('upstream', `${this.config.get('RICK_AND_MORTY_API_URL')}/episode/1`, {
          timeout: UPSTREAM_TIMEOUT_MS,
        }),
    ]);
  }
}
