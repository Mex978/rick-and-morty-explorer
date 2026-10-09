import { afterEach, describe, expect, it, vi } from 'vitest';

import { getEpisode, getEpisodes } from '@/lib/api';
import { stubFetch } from '../fixtures';

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

  it('sends the search query as the name filter', async () => {
    const fetchMock = stubFetch(200, { info: {}, results: [] });

    await getEpisodes(1, 'rick');

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3001/api/v1/episodes?page=1&name=rick',
      expect.anything(),
    );
  });

  it('returns the parsed episode detail', async () => {
    stubFetch(200, { id: 1, name: 'Pilot' });

    await expect(getEpisode(1)).resolves.toEqual({ id: 1, name: 'Pilot' });
  });

  it.each([404, 400])('returns null when the api answers %s', async (status) => {
    stubFetch(status, { message: 'nope' });

    await expect(getEpisode(999)).resolves.toBeNull();
  });

  it('throws on any other failure', async () => {
    stubFetch(502, { message: 'Bad Gateway' });

    await expect(getEpisode(1)).rejects.toThrow('API responded 502');
  });
});
