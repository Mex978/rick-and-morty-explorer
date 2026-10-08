import type { Episode, EpisodeDetail, Paginated } from '@rma/types';

export class ApiError extends Error {
  constructor(
    readonly status: number,
    path: string,
  ) {
    super(`Request to ${path} failed with status ${status}`);
    this.name = 'ApiError';
  }
}

async function get<T>(path: string): Promise<T> {
  const baseUrl = process.env.API_URL ?? 'http://localhost:3001';
  const response = await fetch(`${baseUrl}/api/v1${path}`, { next: { revalidate: 3600 } });

  if (!response.ok) throw new ApiError(response.status, path);

  return response.json() as Promise<T>;
}

export function getEpisodes(page: number): Promise<Paginated<Episode>> {
  return get(`/episodes?page=${page}`);
}

export function getEpisode(id: number): Promise<EpisodeDetail> {
  return get(`/episodes/${id}`);
}
