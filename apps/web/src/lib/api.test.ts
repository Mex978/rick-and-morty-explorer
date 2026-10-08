import { afterEach, describe, expect, it, vi } from 'vitest';

import { ApiError, getEpisode, getEpisodes } from './api';

function stubFetch(status: number, body: unknown) {
  const fetchMock = vi.fn().mockResolvedValue({ ok: status < 400, status, json: () => Promise.resolve(body) });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

describe('api client', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it('requests the episodes page from the configured api url with revalidation', async () => {
    vi.stubEnv('API_URL', 'http://api:3001');
    const fetchMock = stubFetch(200, { info: {}, results: [] });

    await getEpisodes(2);

    expect(fetchMock).toHaveBeenCalledWith('http://api:3001/api/v1/episodes?page=2', {
      next: { revalidate: 3600 },
    });
  });

  it('returns the parsed episode detail', async () => {
    stubFetch(200, { id: 1, name: 'Pilot' });

    await expect(getEpisode(1)).resolves.toEqual({ id: 1, name: 'Pilot' });
  });

  it('throws an ApiError carrying the status on failure', async () => {
    stubFetch(404, { message: 'Not Found' });

    const error = await getEpisode(999).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).status).toBe(404);
  });
});
