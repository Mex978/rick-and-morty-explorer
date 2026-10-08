import { describe, expect, it } from 'vitest';

import { render, screen } from '../../../test/render';
import { Pagination } from '.';

describe('Pagination', () => {
  it('disables both links when there is a single page', () => {
    render(<Pagination currentPage={1} totalPages={1} prevHref={null} nextHref={null} />);

    expect(screen.getByText('Página 1 de 1')).toBeInTheDocument();
    expect(screen.queryAllByRole('link')).toHaveLength(0);
    expect(screen.getByRole('button', { name: 'Anterior' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Próxima' })).toBeDisabled();
  });

  it('links to both neighbours in the middle', () => {
    render(<Pagination currentPage={2} totalPages={3} prevHref="/?page=1" nextHref="/?page=3" />);

    expect(screen.getByRole('link', { name: 'Anterior' })).toHaveAttribute('href', '/pt-BR?page=1');
    expect(screen.getByRole('link', { name: 'Próxima' })).toHaveAttribute('href', '/pt-BR?page=3');
  });

  it('disables the next link on the last page', () => {
    render(<Pagination currentPage={3} totalPages={3} prevHref="/?page=2" nextHref={null} />);

    expect(screen.getByRole('link', { name: 'Anterior' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Próxima' })).toBeDisabled();
  });
});
