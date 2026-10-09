import { Injectable } from '@nestjs/common';
import { Counter, Histogram, Registry, collectDefaultMetrics } from 'prom-client';

@Injectable()
export class MetricsService {
  readonly registry = new Registry();

  readonly httpRequestDuration = new Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of handled HTTP requests',
    labelNames: ['method', 'route', 'status'],
    buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
    registers: [this.registry],
  });

  readonly cacheEvents = new Counter({
    name: 'cache_events_total',
    help: 'Responses served from the in-memory cache versus computed',
    labelNames: ['result'],
    registers: [this.registry],
  });

  readonly upstreamRequestDuration = new Histogram({
    name: 'upstream_request_duration_seconds',
    help: 'Duration of requests to the Rick and Morty API',
    labelNames: ['operation', 'status'],
    buckets: [0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
    registers: [this.registry],
  });

  constructor() {
    collectDefaultMetrics({ register: this.registry });
  }

  recordRequest(request: {
    method: string;
    route: string;
    status: number;
    durationMs: number;
    cache?: string;
  }) {
    this.httpRequestDuration.observe(
      { method: request.method, route: request.route, status: request.status },
      request.durationMs / 1000,
    );
    if (request.cache === 'HIT' || request.cache === 'MISS') {
      this.cacheEvents.inc({ result: request.cache.toLowerCase() });
    }
  }

  render(): Promise<string> {
    return this.registry.metrics();
  }
}
