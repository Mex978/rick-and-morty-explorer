import { useRouter } from 'next/navigation';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { EpisodesLayout } from '@/features/episodes/Layout';
import { seasons } from '../../fixtures';
import { act, fireEvent, render, screen, within } from '../../render';

const router = { replace: vi.fn(), push: vi.fn() };
const searchbox = () => screen.getByRole('searchbox', { name: 'Buscar episódio' });

describe('EpisodesLayout', () => {
  beforeEach(() => {
    router.replace.mockReset();
    vi.mocked(useRouter).mockReturnValue(router as never);
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders episodes grouped by season in pt-BR', () => {
    render(<EpisodesLayout query="" seasons={seasons} page={1} pages={3} />);

    expect(screen.getByRole('heading', { level: 1, name: 'Episódios' })).toBeInTheDocument();

    const seasonOne = screen.getByRole('region', { name: 'Temporada 1' });
    expect(within(seasonOne).getAllByRole('listitem')).toHaveLength(2);
    expect(within(seasonOne).getByText('2 de dezembro de 2013')).toBeInTheDocument();
    expect(within(seasonOne).getByText('19 personagens')).toBeInTheDocument();
    expect(within(seasonOne).getByText('1 personagem')).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Temporada 2' })).toHaveTextContent(
      'A Rickle in Time',
    );
  });

  it('links each episode to its detail page', () => {
    render(<EpisodesLayout query="" seasons={seasons} page={1} pages={3} />);

    expect(screen.getByRole('link', { name: /Pilot/ })).toHaveAttribute(
      'href',
      '/pt-BR/episodes/1',
    );
  });

  it('shows the current query and an empty state when nothing matches', () => {
    render(<EpisodesLayout query="nothing" seasons={[]} page={1} pages={0} />);

    expect(searchbox()).toHaveValue('nothing');
    expect(screen.getByText(/Nenhum episódio encontrado para “nothing”/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Limpar busca' })).toHaveAttribute('href', '/pt-BR');
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });

  it('searches after the user stops typing', () => {
    render(<EpisodesLayout query="" seasons={seasons} page={1} pages={3} />);

    fireEvent.change(searchbox(), { target: { value: 'ri' } });
    fireEvent.change(searchbox(), { target: { value: 'rick' } });
    expect(router.replace).not.toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(300));

    expect(router.replace).toHaveBeenCalledTimes(1);
    expect(router.replace).toHaveBeenCalledWith('/pt-BR?q=rick');
  });

  it('searches immediately when the user presses enter', () => {
    render(<EpisodesLayout query="" seasons={seasons} page={1} pages={3} />);

    fireEvent.change(searchbox(), { target: { value: 'morty' } });
    fireEvent.submit(searchbox().closest('form')!);

    expect(router.replace).toHaveBeenCalledWith('/pt-BR?q=morty');
  });

  it('goes back to the full list as soon as the search is cleared', () => {
    render(<EpisodesLayout query="rick" seasons={seasons} page={1} pages={1} />);

    fireEvent.change(searchbox(), { target: { value: '' } });

    expect(router.replace).toHaveBeenCalledWith('/pt-BR');
  });

  it('reflects a query that changed outside the input', () => {
    const { rerender } = render(
      <EpisodesLayout query="rick" seasons={seasons} page={1} pages={1} />,
    );

    rerender(<EpisodesLayout query="" seasons={seasons} page={1} pages={1} />);

    expect(searchbox()).toHaveValue('');
  });
});
