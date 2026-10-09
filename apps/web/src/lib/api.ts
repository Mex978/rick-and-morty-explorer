import type { Episode, EpisodeDetail, Paginated } from '@rma/types';

const REVALIDATE_SECONDS = 3600;

export function getEpisodes(page: number, query = '') {
  const params = new URLSearchParams({ page: String(page) });
  if (query) params.set('name', query);

  return get<Paginated<Episode>>(`/episodes?${params}`);
}

export function getEpisode(id: number) {
  return get<EpisodeDetail>(`/episodes/${id}`);
}

async function get<T>(path: string): Promise<T | null> {
  const baseUrl = process.env.API_URL ?? 'http://localhost:3001';
  const response = await fetch(`${baseUrl}/api/v1${path}`, {
    next: { revalidate: REVALIDATE_SECONDS },
  });

  if (response.status === 404 || response.status === 400) return null;
  if (!response.ok) throw new Error(`API responded ${response.status} to ${path}`);

  return response.json();
}
