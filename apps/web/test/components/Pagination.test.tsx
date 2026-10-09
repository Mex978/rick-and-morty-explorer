import { useSearchParams } from 'next/navigation';
import { describe, expect, it, vi } from 'vitest';

import { Pagination, pageWindow } from '@/components/Pagination';
import { fireEvent, render, screen } from '../render';

describe('Pagination', () => {
  it('disables both controls when there is a single page', () => {
    render(<Pagination page={1} pages={1} />);

    expect(screen.getByRole('navigation', { name: 'Paginação' })).toHaveTextContent(
      'Página 1 de 1',
    );
    expect(screen.queryAllByRole('link')).toHaveLength(0);
    expect(screen.getByRole('button', { name: 'Anterior' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Próxima' })).toBeDisabled();
  });

  it('links to both neighbours in the middle, keeping the other query params', () => {
    vi.mocked(useSearchParams).mockReturnValue(new URLSearchParams('page=2&q=rick') as never);

    render(<Pagination page={2} pages={3} />);

    expect(screen.getByRole('link', { name: 'Anterior' })).toHaveAttribute(
      'href',
      '/pt-BR?page=1&q=rick',
    );
    expect(screen.getByRole('link', { name: 'Próxima' })).toHaveAttribute(
      'href',
      '/pt-BR?page=3&q=rick',
    );
  });

  it('disables the next control on the last page', () => {
    render(<Pagination page={3} pages={3} />);

    expect(screen.getByRole('link', { name: 'Anterior' })).toHaveAttribute('href', '/pt-BR?page=2');
    expect(screen.getByRole('button', { name: 'Próxima' })).toBeDisabled();
  });

  it('turns into buttons that report the target page when the caller owns the page', () => {
    const onChange = vi.fn();

    render(<Pagination page={2} pages={3} onChange={onChange} />);

    expect(screen.queryAllByRole('link')).toHaveLength(0);
    fireEvent.click(screen.getByRole('button', { name: 'Anterior' }));
    fireEvent.click(screen.getByRole('button', { name: 'Próxima' }));

    expect(onChange).toHaveBeenNthCalledWith(1, 1);
    expect(onChange).toHaveBeenNthCalledWith(2, 3);
  });

  it('still disables the edges when the caller owns the page', () => {
    render(<Pagination page={1} pages={1} onChange={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'Anterior' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Próxima' })).toBeDisabled();
  });

  it('lists every page as a link, marking the current one', () => {
    render(<Pagination page={2} pages={3} />);

    expect(screen.getByRole('link', { name: 'Ir para a página 1' })).toHaveAttribute(
      'href',
      '/pt-BR?page=1',
    );
    expect(screen.getByRole('link', { name: 'Ir para a página 3' })).toHaveAttribute(
      'href',
      '/pt-BR?page=3',
    );
    expect(screen.queryByRole('link', { name: 'Ir para a página 2' })).not.toBeInTheDocument();
    expect(screen.getByText('2')).toHaveAttribute('aria-current', 'page');
  });

  it('reports the chosen page number when the caller owns the page', () => {
    const onChange = vi.fn();

    render(<Pagination page={1} pages={4} onChange={onChange} />);

    fireEvent.click(screen.getByRole('button', { name: 'Ir para a página 3' }));

    expect(onChange).toHaveBeenCalledWith(3);
  });

  it('skips pages far from the current one with a gap', () => {
    expect(pageWindow(1, 3)).toEqual([1, 2, 3]);
    expect(pageWindow(4, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(pageWindow(1, 10)).toEqual([1, 2, 'gap', 10]);
    expect(pageWindow(5, 10)).toEqual([1, 'gap', 4, 5, 6, 'gap', 10]);
    expect(pageWindow(3, 10)).toEqual([1, 2, 3, 4, 'gap', 10]);
    expect(pageWindow(10, 10)).toEqual([1, 'gap', 9, 10]);
  });
});
