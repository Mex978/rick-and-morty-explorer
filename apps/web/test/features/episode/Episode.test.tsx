import { afterEach, describe, expect, it, vi } from 'vitest';

import { Episode } from '@/features/episode';
import { episodeDetail, stubFetch } from '../../fixtures';
import { render, screen } from '../../render';

describe('Episode', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders the full page from the api response', async () => {
    stubFetch(200, episodeDetail);

    render(await Episode({ id: 1 }));

    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:3001/api/v1/episodes/1',
      expect.anything(),
    );
    expect(screen.getByRole('heading', { level: 1, name: 'Pilot' })).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
    expect(screen.getByRole('link', { name: /Voltar para os episódios/ })).toHaveAttribute(
      'href',
      '/pt-BR',
    );
  });

  it('renders the not found page when the api answers 404', async () => {
    stubFetch(404, { message: 'nope' });

    await expect(Episode({ id: 999 })).rejects.toMatchObject({
      digest: expect.stringContaining('404'),
    });
  });

  it('lets any other failure reach the error boundary', async () => {
    stubFetch(400, { message: 'nope' });

    await expect(Episode({ id: 999 })).rejects.toThrow('API responded 400');
  });
});
