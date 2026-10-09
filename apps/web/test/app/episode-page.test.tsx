import { beforeEach, describe, expect, it, vi } from 'vitest';

import { generateMetadata } from '@/app/[locale]/episodes/[id]/page';
import { getEpisode } from '@/lib/api';
import { episodeDetail } from '../fixtures';

vi.mock('@/lib/api', () => ({ getEpisode: vi.fn() }));

const props = { params: Promise.resolve({ locale: 'en', id: '1' }) };

describe('episode page metadata', () => {
  beforeEach(() => {
    vi.mocked(getEpisode).mockReset();
  });

  it('titles the page after the episode', async () => {
    vi.mocked(getEpisode).mockResolvedValue(episodeDetail);

    await expect(generateMetadata(props)).resolves.toEqual({
      title: 'S01E01 · Pilot',
      alternates: {
        canonical: '/en/episodes/1',
        languages: { 'pt-BR': '/pt-BR/episodes/1', en: '/en/episodes/1' },
      },
    });
  });

  it('leaves the metadata empty when the episode does not exist', async () => {
    vi.mocked(getEpisode).mockResolvedValue(null);

    await expect(generateMetadata(props)).resolves.toEqual({});
  });
});
