import { beforeEach, describe, expect, it, vi } from 'vitest';

import { render, screen } from '../../../test/render';
import { ThemeToggle } from '.';

describe('ThemeToggle', () => {
  beforeEach(() => {
    delete document.documentElement.dataset.theme;
    localStorage.clear();
    vi.stubGlobal('matchMedia', () => ({ matches: false }));
    delete (document as { startViewTransition?: unknown }).startViewTransition;
  });

  it('switches to dark when the system is light and remembers it', () => {
    render(<ThemeToggle />);

    screen.getByRole('button', { name: 'Alternar tema' }).click();

    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(localStorage.getItem('theme')).toBe('dark');
  });

  it('reveals the new theme in a circle from the click when view transitions are supported', async () => {
    const animate = vi.fn();
    document.documentElement.animate = animate;
    document.startViewTransition = vi.fn((update: () => void) => {
      update();
      return { ready: Promise.resolve() } as ViewTransition;
    });
    render(<ThemeToggle />);

    screen.getByRole('button', { name: 'Alternar tema' }).click();
    await Promise.resolve();

    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(animate).toHaveBeenCalledWith(
      { clipPath: [expect.stringMatching(/^circle\(0px at /), expect.stringMatching(/^circle\(\d/)] },
      expect.objectContaining({ pseudoElement: '::view-transition-new(root)' }),
    );
  });

  it('still applies the theme when the browser skips the transition', async () => {
    document.startViewTransition = vi.fn((update: () => void) => {
      update();
      return { ready: Promise.reject(new DOMException('skipped', 'InvalidStateError')) } as ViewTransition;
    });
    render(<ThemeToggle />);

    screen.getByRole('button', { name: 'Alternar tema' }).click();
    await Promise.resolve();

    expect(document.documentElement.dataset.theme).toBe('dark');
  });

  it('switches back to light on the next click', () => {
    render(<ThemeToggle />);
    const button = screen.getByRole('button', { name: 'Alternar tema' });

    button.click();
    button.click();

    expect(document.documentElement.dataset.theme).toBe('light');
  });
});
