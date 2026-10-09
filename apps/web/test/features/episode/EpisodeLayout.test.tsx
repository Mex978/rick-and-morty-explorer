import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { EpisodeLayout } from '@/features/episode/Layout';
import { episodeDetail, manyCharacters } from '../../fixtures';
import { act, cleanup, fireEvent, render, screen, within } from '../../render';

const filter = () => screen.getByRole('searchbox', { name: 'Filtrar personagens' });
const grid = () => screen.getByRole('list', { name: 'Personagens' });
const names = () =>
  within(grid())
    .getAllByRole('listitem')
    .map((item) => within(item).getByRole('img').getAttribute('alt'));

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

    expect(within(grid()).queryAllByRole('listitem')).toHaveLength(0);
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

describe('EpisodeLayout pagination', () => {
  const thirty = { ...episodeDetail, characterCount: 30, characters: manyCharacters(30) };
  const status = () => screen.getByRole('navigation', { name: 'Paginação' });
  const next = () => fireEvent.click(screen.getByRole('button', { name: 'Próxima' }));

  beforeEach(() => {
    Element.prototype.scrollIntoView = vi.fn();
  });

  it('shows ten characters per page and no controls when they all fit', () => {
    render(<EpisodeLayout episode={thirty} />);

    expect(names()).toHaveLength(10);
    expect(names()[0]).toBe('Clone 01');
    expect(status()).toHaveTextContent('Página 1 de 3');

    cleanup();
    render(<EpisodeLayout episode={episodeDetail} />);

    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });

  it('moves between pages and scrolls back to the section', () => {
    render(<EpisodeLayout episode={thirty} />);

    next();

    expect(names()[0]).toBe('Clone 11');
    expect(names()).toHaveLength(10);
    expect(status()).toHaveTextContent('Página 2 de 3');
    expect(Element.prototype.scrollIntoView).toHaveBeenCalledOnce();

    next();

    expect(names()[0]).toBe('Clone 21');
    expect(names()).toHaveLength(10);
    expect(screen.getByRole('button', { name: 'Próxima' })).toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: 'Anterior' }));

    expect(names()[0]).toBe('Clone 11');
  });

  it('filters across every page and goes back to the first one', () => {
    render(<EpisodeLayout episode={thirty} />);
    next();
    next();

    fireEvent.change(filter(), { target: { value: 'clone 2' } });

    expect(names()).toEqual([
      'Clone 20',
      'Clone 21',
      'Clone 22',
      'Clone 23',
      'Clone 24',
      'Clone 25',
      'Clone 26',
      'Clone 27',
      'Clone 28',
      'Clone 29',
    ]);
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });

  it('keeps the filter when changing page and restores everything when it is cleared', () => {
    render(<EpisodeLayout episode={thirty} />);
    next();

    fireEvent.change(filter(), { target: { value: 'clone' } });

    expect(status()).toHaveTextContent('Página 1 de 3');
    expect(names()[0]).toBe('Clone 01');

    next();

    expect(filter()).toHaveValue('clone');
    expect(names()[0]).toBe('Clone 11');

    fireEvent.change(filter(), { target: { value: '' } });

    expect(status()).toHaveTextContent('Página 1 de 3');
    expect(names()).toHaveLength(10);
  });

  it('jumps straight to a chosen page', () => {
    render(<EpisodeLayout episode={thirty} />);

    fireEvent.click(screen.getByRole('button', { name: 'Ir para a página 3' }));

    expect(names()[0]).toBe('Clone 21');
    expect(status()).toHaveTextContent('Página 3 de 3');
  });

  it('hides the controls with the empty state', () => {
    render(<EpisodeLayout episode={thirty} />);

    fireEvent.change(filter(), { target: { value: 'jerry' } });

    expect(screen.getByText('Nenhum personagem encontrado para “jerry”.')).toBeInTheDocument();
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });
});
