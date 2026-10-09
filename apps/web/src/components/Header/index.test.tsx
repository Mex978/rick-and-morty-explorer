import { describe, expect, it, vi } from 'vitest';

import { render, screen } from '../../../test/render';
import { Header } from '.';

vi.mock('next/navigation', async (importOriginal) => ({
  ...(await importOriginal<typeof import('next/navigation')>()),
  useSearchParams: () => new URLSearchParams('page=2&q=rick'),
}));

vi.mock('@/i18n/navigation', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/i18n/navigation')>()),
  usePathname: () => '/',
}));

describe('Header', () => {
  it('switches language keeping the current path and query', () => {
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
