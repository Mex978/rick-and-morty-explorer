import { timingSafeEqual } from 'node:crypto';

import { Injectable, UnauthorizedException } from '@nestjs/common';
import type { CanActivate, ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';

import type { Env } from '../config/env';

@Injectable()
export class MetricsTokenGuard implements CanActivate {
  constructor(private readonly config: ConfigService<Env, true>) {}

  canActivate(context: ExecutionContext): boolean {
    const expected = this.config.get('METRICS_TOKEN');
    if (!expected) return true;

    const header = context.switchToHttp().getRequest<Request>().header('authorization') ?? '';
    const presented = header.replace(/^Bearer\s+/i, '');
    if (!equals(presented, expected)) throw new UnauthorizedException();
    return true;
  }
}

function equals(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}
