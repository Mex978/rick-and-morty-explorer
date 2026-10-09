import { describe, expect, it, vi } from 'vitest';

import CatchAll from '@/app/[locale]/[...rest]/page';
import EpisodeLoading from '@/app/[locale]/episodes/[id]/loading';
import RouteError from '@/app/[locale]/error';
import Loading from '@/app/[locale]/loading';
import NotFound from '@/app/[locale]/not-found';
import { fireEvent, render, screen } from '../render';

describe('route states', () => {
  it.each([
    ['list', Loading],
    ['episode', EpisodeLoading],
  ])('announces the %s skeleton as a loading status', (_, Skeleton) => {
    render(<Skeleton />);

    const status = screen.getByRole('status');
    expect(status).toHaveAttribute('aria-busy', 'true');
    expect(status).toHaveTextContent('Carregando...');
  });

  it('lets the user retry after an error', () => {
    const reset = vi.fn();
    render(<RouteError error={new Error('boom')} reset={reset} />);

    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));

    expect(reset).toHaveBeenCalledOnce();
  });

  it('links back to the episodes from the not found page', () => {
    render(<NotFound />);

    expect(
      screen.getByRole('heading', { level: 1, name: 'Página não encontrada' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ir para os episódios' })).toHaveAttribute(
      'href',
      '/pt-BR',
    );
  });

  it('sends unknown urls to the not found page', () => {
    expect(() => CatchAll()).toThrow(
      expect.objectContaining({ digest: expect.stringContaining('404') }),
    );
  });
});
