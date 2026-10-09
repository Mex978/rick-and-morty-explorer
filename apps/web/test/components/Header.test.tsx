import { useSearchParams } from 'next/navigation';
import { describe, expect, it, vi } from 'vitest';

import { Header } from '@/components/Header';
import { render, screen } from '../render';

describe('Header', () => {
  it('switches language keeping the current path and query', () => {
    vi.mocked(useSearchParams).mockReturnValue(new URLSearchParams('page=2&q=rick') as never);

    render(<Header />);

    expect(screen.getByRole('link', { name: 'English' })).toHaveAttribute(
      'href',
      '/en?page=2&q=rick',
    );
    expect(screen.getByRole('link', { name: 'Português (Brasil)' })).toHaveAttribute(
      'aria-current',
      'true',
    );
  });
});
