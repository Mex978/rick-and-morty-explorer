import { randomUUID } from 'node:crypto';

import { Injectable, Logger } from '@nestjs/common';
import type { NestMiddleware } from '@nestjs/common';
import type { Request, Response } from 'express';

import { MetricsService } from './metrics.service';

const REQUEST_ID = /^[\w.-]{1,64}$/;

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  constructor(private readonly metrics: MetricsService) {}

  use(request: Request, response: Response, next: () => void): void {
    const requestId = request.header('x-request-id')?.match(REQUEST_ID)?.[0] ?? randomUUID();
    const startedAt = process.hrtime.bigint();
    response.setHeader('x-request-id', requestId);

    response.on('finish', () => {
      const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;
      const status = response.statusCode;
      const cache = response.getHeader('x-cache')?.toString();

      this.metrics.recordRequest({
        method: request.method,
        route: routeOf(request),
        status,
        durationMs,
        cache,
      });

      const line = {
        requestId,
        method: request.method,
        url: request.originalUrl,
        status,
        durationMs: Math.round(durationMs),
        cache,
      };
      if (status >= 500) this.logger.error(line);
      else if (status >= 400) this.logger.warn(line);
      else this.logger.log(line);
    });

    next();
  }
}

const routeOf = (request: Request) =>
  request.route ? `${request.baseUrl}${request.route.path}` : 'unmatched';
