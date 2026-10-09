import { HttpService } from '@nestjs/axios';
import {
  BadGatewayException,
  GatewayTimeoutException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { isAxiosError } from 'axios';
import type { AxiosError } from 'axios';
import { firstValueFrom } from 'rxjs';

import { MetricsService } from '../observability/metrics.service';
import type { RawCharacter, RawEpisode, RawPaginated } from './rick-and-morty.types';

@Injectable()
export class RickAndMortyClient {
  private readonly logger = new Logger(RickAndMortyClient.name);

  constructor(
    private readonly http: HttpService,
    private readonly metrics: MetricsService,
  ) {}

  getEpisodes(page: number, name?: string): Promise<RawPaginated<RawEpisode>> {
    return this.get<RawPaginated<RawEpisode>>(
      'getEpisodes',
      '/episode',
      name ? { page, name } : { page },
    );
  }

  getEpisode(id: number): Promise<RawEpisode> {
    return this.get<RawEpisode>('getEpisode', `/episode/${id}`);
  }

  async getCharacters(ids: number[]): Promise<RawCharacter[]> {
    if (ids.length === 0) return [];

    const data = await this.get<RawCharacter | RawCharacter[]>(
      'getCharacters',
      `/character/${ids.join(',')}`,
    );

    // The upstream returns a bare object instead of a one-element array when a single id is requested.
    return Array.isArray(data) ? data : [data];
  }

  private async get<T>(
    operation: string,
    path: string,
    params?: Record<string, string | number>,
  ): Promise<T> {
    const stop = this.metrics.upstreamRequestDuration.startTimer({ operation });
    try {
      const response = await firstValueFrom(this.http.get<T>(path, { params }));
      stop({ status: response.status });
      return response.data;
    } catch (error) {
      if (!isAxiosError(error)) throw error;
      stop({ status: error.response?.status ?? error.code ?? 'error' });
      throw this.toHttpException(error, path);
    }
  }

  private toHttpException(error: AxiosError, path: string): Error {
    if (error.response?.status === 404) {
      return new NotFoundException(undefined, { cause: error });
    }

    this.logger.error(`Upstream request to ${path} failed: ${error.message}`);

    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      return new GatewayTimeoutException('Upstream request timed out', { cause: error });
    }
    return new BadGatewayException('Upstream request failed', { cause: error });
  }
}
