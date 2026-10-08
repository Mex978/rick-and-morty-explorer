import { HttpService } from '@nestjs/axios';
import {
  BadGatewayException,
  GatewayTimeoutException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { isAxiosError } from 'axios';
import { firstValueFrom } from 'rxjs';

import type { RawCharacter, RawEpisode, RawPaginated } from './rick-and-morty.types';

@Injectable()
export class RickAndMortyClient {
  constructor(private readonly http: HttpService) {}

  getEpisodes(page: number): Promise<RawPaginated<RawEpisode>> {
    return this.get<RawPaginated<RawEpisode>>('/episode', { page });
  }

  getEpisode(id: number): Promise<RawEpisode> {
    return this.get<RawEpisode>(`/episode/${id}`);
  }

  async getCharacters(ids: number[]): Promise<RawCharacter[]> {
    if (ids.length === 0) return [];

    const data = await this.get<RawCharacter | RawCharacter[]>(`/character/${ids.join(',')}`);

    // The upstream returns a bare object instead of a one-element array when a single id is requested.
    return Array.isArray(data) ? data : [data];
  }

  private async get<T>(path: string, params?: Record<string, number>): Promise<T> {
    try {
      const response = await firstValueFrom(this.http.get<T>(path, { params }));
      return response.data;
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  private toHttpException(error: unknown): Error {
    if (!isAxiosError(error)) {
      return new BadGatewayException('Upstream request failed');
    }
    if (error.response?.status === 404) {
      return new NotFoundException();
    }
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      return new GatewayTimeoutException('Upstream request timed out');
    }
    return new BadGatewayException('Upstream request failed');
  }
}
