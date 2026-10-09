import { setTimeout as sleep } from 'node:timers/promises';

import { Injectable } from '@nestjs/common';
import type { BeforeApplicationShutdown } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import type { Env } from '../config/env';

// Nest awaits this hook before closing the http server, so the process keeps serving while it
// reports not ready and the balancer stops sending traffic.
@Injectable()
export class ProcessState implements BeforeApplicationShutdown {
  private shuttingDown = false;

  constructor(private readonly config: ConfigService<Env, true>) {}

  get isShuttingDown(): boolean {
    return this.shuttingDown;
  }

  async beforeApplicationShutdown(): Promise<void> {
    this.shuttingDown = true;
    const drainMs = this.config.get('SHUTDOWN_DRAIN_MS');
    if (drainMs > 0) await sleep(drainMs);
  }
}
