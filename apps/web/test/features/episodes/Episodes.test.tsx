import { useSearchParams } from 'next/navigation';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Episodes } from '@/features/episodes';
import { getEpisodes } from '@/lib/api';
import { episodesPage } from '../../fixtures';
import { render, screen } from '../../render';

vi.mock('@/lib/api', () => ({ getEpisodes: vi.fn() }));

describe('Episodes', () => {
  beforeEach(() => {
    vi.mocked(getEpisodes).mockReset();
  });

  it('groups episodes by season from their code', async () => {
    vi.mocked(getEpisodes).mockResolvedValue(episodesPage());

    render(await Episodes({ page: 1, query: '' }));

    expect(getEpisodes).toHaveBeenCalledWith(1, '');
    expect(screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)).toEqual([
      'Temporada 1',
      'Temporada 2',
    ]);
  });

  it('paginates around the current page keeping the search query', async () => {
    vi.mocked(getEpisodes).mockResolvedValue(episodesPage({ currentPage: 2 }));
    vi.mocked(useSearchParams).mockReturnValue(new URLSearchParams('page=2&q=rick') as never);

    render(await Episodes({ page: 2, query: 'rick' }));

    expect(getEpisodes).toHaveBeenCalledWith(2, 'rick');
    expect(screen.getByRole('link', { name: 'Anterior' })).toHaveAttribute(
      'href',
      '/pt-BR?page=1&q=rick',
    );
    expect(screen.getByRole('link', { name: 'Próxima' })).toHaveAttribute(
      'href',
      '/pt-BR?page=3&q=rick',
    );
  });

  it('renders the not found page when the api has nothing for the request', async () => {
    vi.mocked(getEpisodes).mockResolvedValue(null);

    await expect(Episodes({ page: 99, query: '' })).rejects.toMatchObject({
      digest: expect.stringContaining('404'),
    });
  });
});
