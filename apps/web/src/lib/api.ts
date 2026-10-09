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

// Only a 404 is "nothing there". Pages validate their input before calling, so a 400 is a bug
// on this side and surfaces as an error instead of hiding behind the not found page.
async function get<T>(path: string): Promise<T | null> {
  const baseUrl = process.env.API_URL ?? 'http://localhost:3001';
  const response = await fetch(`${baseUrl}/api/v1${path}`, {
    next: { revalidate: REVALIDATE_SECONDS },
  });

  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`API responded ${response.status} to ${path}`);

  return response.json();
}
