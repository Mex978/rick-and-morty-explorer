import { beforeEach, describe, expect, it, vi } from 'vitest';

import { episodesPage } from '../../../test/fixtures';
import { render, screen } from '../../../test/render';
import { ApiError, getEpisodes } from '@/lib/api';
import { Episodes } from '.';

vi.mock('@/i18n/navigation', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/i18n/navigation')>()),
  useRouter: () => ({ replace: vi.fn() }),
}));

vi.mock('@/lib/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/api')>()),
  getEpisodes: vi.fn(),
}));

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

  it('builds pagination links around the current page', async () => {
    vi.mocked(getEpisodes).mockResolvedValue(episodesPage({ currentPage: 2, hasPrev: true, hasNext: true }));

    render(await Episodes({ page: 2, query: '' }));

    expect(screen.getByRole('link', { name: 'Anterior' })).toHaveAttribute('href', '/pt-BR?page=1');
    expect(screen.getByRole('link', { name: 'Próxima' })).toHaveAttribute('href', '/pt-BR?page=3');
  });

  it('keeps the search query in the pagination links', async () => {
    vi.mocked(getEpisodes).mockResolvedValue(episodesPage({ currentPage: 1, hasNext: true }));

    render(await Episodes({ page: 1, query: 'rick' }));

    expect(getEpisodes).toHaveBeenCalledWith(1, 'rick');
    expect(screen.getByRole('link', { name: 'Próxima' })).toHaveAttribute('href', '/pt-BR?page=2&q=rick');
  });

  it('renders the not found page when the page does not exist', async () => {
    vi.mocked(getEpisodes).mockRejectedValue(new ApiError(404, '/episodes?page=99'));

    await expect(Episodes({ page: 99, query: '' })).rejects.toMatchObject({ digest: expect.stringContaining('404') });
  });
});
