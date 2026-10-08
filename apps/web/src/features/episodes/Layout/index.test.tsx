import { describe, expect, it } from 'vitest';

import { episodes } from '../../../../test/fixtures';
import { render, screen, within } from '../../../../test/render';
import { EpisodesLayout } from '.';

const seasons = [
  { season: 1, episodes: episodes.slice(0, 2) },
  { season: 2, episodes: episodes.slice(2) },
];

describe('EpisodesLayout', () => {
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

    expect(screen.getByRole('link', { name: /Pilot/ })).toHaveAttribute('href', '/pt-BR/episodes/1');
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

  it('disables the previous link on the first page and links to the next one', () => {
    render(
      <EpisodesLayout
        query=""
        seasons={seasons}
        pagination={{ currentPage: 1, totalPages: 3, prevHref: null, nextHref: '/?page=2' }}
      />,
    );

    expect(screen.getByText('Anterior')).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByRole('link', { name: 'Próxima' })).toHaveAttribute('href', '/pt-BR?page=2');
  });
});
