import { afterEach, describe, expect, it, vi } from 'vitest';

import { episodeDetail } from '../../../test/fixtures';
import { render, screen } from '../../../test/render';
import { Episode } from '.';

function stubFetch(status: number, body: unknown) {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({ ok: status < 400, status, json: () => Promise.resolve(body) }),
  );
}

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

  it('renders the not found page when the api returns 404', async () => {
    stubFetch(404, { message: 'Not Found' });

    await expect(Episode({ id: 999 })).rejects.toMatchObject({
      digest: expect.stringContaining('404'),
    });
  });

  it('renders the not found page without calling the api for an invalid id', async () => {
    stubFetch(200, episodeDetail);

    await expect(Episode({ id: Number.NaN })).rejects.toMatchObject({
      digest: expect.stringContaining('404'),
    });
    expect(fetch).not.toHaveBeenCalled();
  });
});
