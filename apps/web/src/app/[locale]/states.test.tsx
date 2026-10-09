import { fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { render, screen } from '../../../test/render';
import EpisodeLoading from './episodes/[id]/loading';
import Error from './error';
import Loading from './loading';
import NotFound from './not-found';

describe('route states', () => {
  it('announces the list skeleton as a loading status', () => {
    render(<Loading />);

    const status = screen.getByRole('status');
    expect(status).toHaveAttribute('aria-busy', 'true');
    expect(status).toHaveTextContent('Carregando...');
  });

  it('announces the episode skeleton as a loading status', () => {
    render(<EpisodeLoading />);

    expect(screen.getByRole('status')).toHaveTextContent('Carregando...');
  });

  it('lets the user retry after an error', () => {
    const reset = vi.fn();
    render(<Error error={new globalThis.Error('boom')} reset={reset} />);

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
});
