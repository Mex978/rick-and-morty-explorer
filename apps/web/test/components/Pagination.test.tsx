import { useSearchParams } from 'next/navigation';
import { describe, expect, it, vi } from 'vitest';

import { Pagination } from '@/components/Pagination';
import { render, screen } from '../render';

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
});
