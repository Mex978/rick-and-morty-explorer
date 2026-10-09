import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiError, getEpisode } from '@/lib/api';
import { generateMetadata } from './page';

vi.mock('@/lib/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/api')>()),
  getEpisode: vi.fn(),
}));

const props = { params: Promise.resolve({ locale: 'en', id: '1' }) };

describe('episode page metadata', () => {
  beforeEach(() => {
    vi.mocked(getEpisode).mockReset();
  });

  it('titles the page after the episode', async () => {
    vi.mocked(getEpisode).mockResolvedValue({ code: 'S01E01', name: 'Pilot' } as Awaited<
      ReturnType<typeof getEpisode>
    >);

    await expect(generateMetadata(props)).resolves.toEqual({
      title: 'S01E01 · Pilot',
      alternates: {
        canonical: '/en/episodes/1',
        languages: { 'pt-BR': '/pt-BR/episodes/1', en: '/en/episodes/1' },
      },
    });
  });

  it('leaves the metadata empty when the episode does not exist', async () => {
    vi.mocked(getEpisode).mockRejectedValue(new ApiError(404, '/episodes/1'));

    await expect(generateMetadata(props)).resolves.toEqual({});
  });

  it('does not swallow unexpected failures', async () => {
    vi.mocked(getEpisode).mockRejectedValue(new TypeError('fetch failed'));

    await expect(generateMetadata(props)).rejects.toThrow('fetch failed');
  });
});
