import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { EpisodeLayout } from '@/features/episode/Layout';
import { episodeDetail } from '../../fixtures';
import { act, fireEvent, render, screen, within } from '../../render';

const filter = () => screen.getByRole('searchbox', { name: 'Filtrar personagens' });
const names = () =>
  screen.getAllByRole('listitem').map((item) => within(item).getByRole('img').getAttribute('alt'));

describe('EpisodeLayout', () => {
  it('renders the episode header with a formatted air date', () => {
    render(<EpisodeLayout episode={episodeDetail} />);

    expect(screen.getByRole('heading', { level: 1, name: 'Pilot' })).toBeInTheDocument();
    expect(screen.getByText('S01E01')).toBeInTheDocument();
    expect(
      screen.getByText('Exibido em 2 de dezembro de 2013 · 3 personagens'),
    ).toBeInTheDocument();
  });

  it('renders characters in the order received with translated status badges', () => {
    render(<EpisodeLayout episode={episodeDetail} />);

    expect(names()).toEqual(['Bepisian', 'Beth Smith', 'Rick Sanchez']);
    expect(screen.getByText('Vivo')).toBeInTheDocument();
    expect(screen.getByText('Morto')).toBeInTheDocument();
    expect(screen.getByText('Desconhecido')).toBeInTheDocument();
  });

  it('filters characters by name as the user types, without submitting anything', () => {
    render(<EpisodeLayout episode={episodeDetail} />);

    fireEvent.change(filter(), { target: { value: 'SMITH' } });
    fireEvent.submit(filter().closest('form')!);

    expect(names()).toEqual(['Beth Smith']);
  });

  it('shows an empty state when no character matches', () => {
    render(<EpisodeLayout episode={episodeDetail} />);

    fireEvent.change(filter(), { target: { value: 'jerry' } });

    expect(screen.queryAllByRole('listitem')).toHaveLength(0);
    expect(screen.getByText('Nenhum personagem encontrado para “jerry”.')).toBeInTheDocument();
  });
});

describe('EpisodeLayout avatars', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('retries a failed avatar with a cache-busting query and then falls back to the initial', () => {
    render(<EpisodeLayout episode={episodeDetail} />);
    const avatar = () => screen.getByRole('img', { name: 'Bepisian' });
    const src = () => decodeURIComponent(avatar().getAttribute('src')!);

    fireEvent.error(avatar());
    act(() => vi.advanceTimersByTime(4000));
    expect(src()).toContain('35.jpeg?retry=1');

    fireEvent.error(avatar());
    act(() => vi.advanceTimersByTime(8000));
    expect(src()).toContain('35.jpeg?retry=2');

    fireEvent.error(avatar());
    expect(avatar()).toHaveTextContent('B');
    expect(avatar().tagName).toBe('DIV');
  });
});
