import { beforeEach, describe, expect, it, vi } from 'vitest';

import EpisodePage, { generateMetadata } from '@/app/[locale]/episodes/[id]/page';
import { Episode } from '@/features/episode';
import { getEpisode } from '@/lib/api';
import { episodeDetail } from '../fixtures';

vi.mock('@/lib/api', () => ({ getEpisode: vi.fn() }));

const props = (id = '1') => ({ params: Promise.resolve({ locale: 'en', id }) });

describe('episode page metadata', () => {
  beforeEach(() => {
    vi.mocked(getEpisode).mockReset();
  });

  it('titles the page after the episode', async () => {
    vi.mocked(getEpisode).mockResolvedValue(episodeDetail);

    await expect(generateMetadata(props())).resolves.toEqual({
      title: 'S01E01 · Pilot',
      alternates: {
        canonical: '/en/episodes/1',
        languages: { 'pt-BR': '/pt-BR/episodes/1', en: '/en/episodes/1' },
      },
    });
  });

  it('leaves the metadata empty when the episode does not exist', async () => {
    vi.mocked(getEpisode).mockResolvedValue(null);

    await expect(generateMetadata(props())).resolves.toEqual({});
  });

  it.each(['abc', '0', '-1', '1.5'])('does not ask the api about the id %s', async (id) => {
    await expect(generateMetadata(props(id))).resolves.toEqual({});
    await expect(EpisodePage(props(id))).rejects.toMatchObject({
      digest: expect.stringContaining('404'),
    });
    expect(getEpisode).not.toHaveBeenCalled();
  });
});

describe('episode page', () => {
  it('renders the episode feature for a valid id', async () => {
    const page = await EpisodePage(props('7'));

    expect(page.type).toBe(Episode);
    expect(page.props).toEqual({ id: 7 });
  });
});
