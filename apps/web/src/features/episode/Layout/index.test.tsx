import { fireEvent } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { episodeDetail } from '../../../../test/fixtures';
import { render, screen, within } from '../../../../test/render';
import { EpisodeLayout } from '.';

describe('EpisodeLayout', () => {
  it('renders the episode header with a formatted air date', () => {
    render(<EpisodeLayout episode={episodeDetail} />);

    expect(screen.getByRole('heading', { level: 1, name: 'Pilot' })).toBeInTheDocument();
    expect(screen.getByText('S01E01')).toBeInTheDocument();
    expect(
      screen.getByText('Exibido em 2 de dezembro de 2013 · 3 personagens'),
    ).toBeInTheDocument();
  });

  it('renders characters in the order received', () => {
    render(<EpisodeLayout episode={episodeDetail} />);

    const names = screen
      .getAllByRole('listitem')
      .map((item) => within(item).getByRole('img').getAttribute('alt'));

    expect(names).toEqual(['Bepisian', 'Beth Smith', 'Rick Sanchez']);
  });

  it('translates the status badge', () => {
    render(<EpisodeLayout episode={episodeDetail} />);

    expect(screen.getByText('Vivo')).toBeInTheDocument();
    expect(screen.getByText('Morto')).toBeInTheDocument();
    expect(screen.getByText('Desconhecido')).toBeInTheDocument();
  });
});

describe('EpisodeLayout character filter', () => {
  it('filters characters by name as the user types', () => {
    render(<EpisodeLayout episode={episodeDetail} />);

    fireEvent.change(screen.getByRole('searchbox', { name: 'Filtrar personagens' }), {
      target: { value: 'SMITH' },
    });

    expect(screen.getAllByRole('img').map((img) => img.getAttribute('alt'))).toEqual([
      'Beth Smith',
    ]);
  });

  it('shows an empty state when no character matches', () => {
    render(<EpisodeLayout episode={episodeDetail} />);

    fireEvent.change(screen.getByRole('searchbox', { name: 'Filtrar personagens' }), {
      target: { value: 'jerry' },
    });

    expect(screen.queryAllByRole('listitem')).toHaveLength(0);
    expect(screen.getByText('Nenhum personagem encontrado para “jerry”.')).toBeInTheDocument();
  });
});
