import { fireEvent } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { episodes } from '../../../../test/fixtures';
import { render, screen, within } from '../../../../test/render';
import { useRouter } from '@/i18n/navigation';
import { EpisodesLayout } from '.';

vi.mock('@/i18n/navigation', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/i18n/navigation')>()),
  useRouter: vi.fn(),
}));

const replace = vi.fn();

const seasons = [
  { season: 1, episodes: episodes.slice(0, 2) },
  { season: 2, episodes: episodes.slice(2) },
];

describe('EpisodesLayout', () => {
  beforeEach(() => {
    replace.mockReset();
    vi.mocked(useRouter).mockReturnValue({ replace } as unknown as ReturnType<typeof useRouter>);
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders episodes grouped by season in pt-BR', () => {
    render(
      <EpisodesLayout
        query=""
        seasons={seasons}
        pagination={{ currentPage: 1, totalPages: 3, prevHref: null, nextHref: '/?page=2' }}
      />,
    );

    expect(screen.getByRole('heading', { level: 1, name: 'Episódios' })).toBeInTheDocument();

    const seasonOne = screen.getByRole('region', { name: 'Temporada 1' });
    expect(within(seasonOne).getAllByRole('listitem')).toHaveLength(2);
    expect(within(seasonOne).getByText('Pilot')).toBeInTheDocument();
    expect(within(seasonOne).getByText('2 de dezembro de 2013')).toBeInTheDocument();
    expect(within(seasonOne).getByText('19 personagens')).toBeInTheDocument();
    expect(within(seasonOne).getByText('1 personagem')).toBeInTheDocument();

    const seasonTwo = screen.getByRole('region', { name: 'Temporada 2' });
    expect(within(seasonTwo).getByText('A Rickle in Time')).toBeInTheDocument();
  });

  it('links each episode to its detail page', () => {
    render(
      <EpisodesLayout
        query=""
        seasons={seasons}
        pagination={{ currentPage: 1, totalPages: 3, prevHref: null, nextHref: '/?page=2' }}
      />,
    );

    expect(screen.getByRole('link', { name: /Pilot/ })).toHaveAttribute(
      'href',
      '/pt-BR/episodes/1',
    );
  });

  it('shows the current query and an empty state when nothing matches', () => {
    render(
      <EpisodesLayout
        query="nothing"
        seasons={[]}
        pagination={{ currentPage: 1, totalPages: 0, prevHref: null, nextHref: null }}
      />,
    );

    expect(screen.getByRole('searchbox', { name: 'Buscar episódio' })).toHaveValue('nothing');
    expect(screen.getByText(/Nenhum episódio encontrado para “nothing”/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Limpar busca' })).toHaveAttribute('href', '/pt-BR');
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });

  it('searches after the user stops typing', () => {
    render(
      <EpisodesLayout
        query=""
        seasons={seasons}
        pagination={{ currentPage: 1, totalPages: 3, prevHref: null, nextHref: '/?page=2' }}
      />,
    );
    const input = screen.getByRole('searchbox', { name: 'Buscar episódio' });

    fireEvent.change(input, { target: { value: 'ri' } });
    fireEvent.change(input, { target: { value: 'rick' } });
    expect(replace).not.toHaveBeenCalled();

    vi.advanceTimersByTime(300);

    expect(replace).toHaveBeenCalledTimes(1);
    expect(replace).toHaveBeenCalledWith('/?q=rick');
  });

  it('searches immediately when the user presses enter', () => {
    render(
      <EpisodesLayout
        query=""
        seasons={seasons}
        pagination={{ currentPage: 1, totalPages: 3, prevHref: null, nextHref: '/?page=2' }}
      />,
    );
    const input = screen.getByRole('searchbox', { name: 'Buscar episódio' });

    fireEvent.change(input, { target: { value: 'morty' } });
    fireEvent.submit(input.closest('form')!);

    expect(replace).toHaveBeenCalledWith('/?q=morty');
  });

  it('goes back to the full list as soon as the search is cleared', () => {
    render(
      <EpisodesLayout
        query="rick"
        seasons={seasons}
        pagination={{ currentPage: 1, totalPages: 1, prevHref: null, nextHref: null }}
      />,
    );

    fireEvent.change(screen.getByRole('searchbox', { name: 'Buscar episódio' }), {
      target: { value: '' },
    });

    expect(replace).toHaveBeenCalledWith('/');
  });

  it('reflects a query that changed outside the input', () => {
    const pagination = { currentPage: 1, totalPages: 1, prevHref: null, nextHref: null };
    const { rerender } = render(
      <EpisodesLayout query="rick" seasons={seasons} pagination={pagination} />,
    );

    rerender(<EpisodesLayout query="" seasons={seasons} pagination={pagination} />);

    expect(screen.getByRole('searchbox', { name: 'Buscar episódio' })).toHaveValue('');
  });

  it('disables the previous link on the first page and links to the next one', () => {
    render(
      <EpisodesLayout
        query=""
        seasons={seasons}
        pagination={{ currentPage: 1, totalPages: 3, prevHref: null, nextHref: '/?page=2' }}
      />,
    );

    expect(screen.getByRole('button', { name: 'Anterior' })).toBeDisabled();
    expect(screen.getByRole('link', { name: 'Próxima' })).toHaveAttribute('href', '/pt-BR?page=2');
  });
});
