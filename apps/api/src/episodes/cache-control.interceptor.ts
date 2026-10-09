import { Injectable } from '@nestjs/common';
import type { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { tap } from 'rxjs';
import type { Observable } from 'rxjs';

import type { Env } from '../config/env';

// Nest's @Header decorator runs before the handler, so it would stamp 4xx and 5xx responses too.
// Setting the header inside the stream makes only successful responses cacheable.
@Injectable()
export class CacheControlInterceptor implements NestInterceptor {
  constructor(private readonly config: ConfigService<Env, true>) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const response = context
      .switchToHttp()
      .getResponse<{ setHeader(name: string, value: string): void }>();
    const maxAge = this.config.get('CACHE_TTL_SECONDS');

    return next
      .handle()
      .pipe(tap(() => response.setHeader('Cache-Control', `public, max-age=${maxAge}`)));
  }
}
