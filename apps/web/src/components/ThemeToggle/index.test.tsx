import { beforeEach, describe, expect, it, vi } from 'vitest';

import { render, screen } from '../../../test/render';
import { ThemeToggle } from '.';

describe('ThemeToggle', () => {
  beforeEach(() => {
    delete document.documentElement.dataset.theme;
    localStorage.clear();
    vi.stubGlobal('matchMedia', () => ({ matches: false }));
  });

  it('switches to dark when the system is light and remembers it', () => {
    render(<ThemeToggle />);

    screen.getByRole('button', { name: 'Alternar tema' }).click();

    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(localStorage.getItem('theme')).toBe('dark');
  });

  it('switches back to light on the next click', () => {
    render(<ThemeToggle />);
    const button = screen.getByRole('button', { name: 'Alternar tema' });

    button.click();
    button.click();

    expect(document.documentElement.dataset.theme).toBe('light');
  });
});
