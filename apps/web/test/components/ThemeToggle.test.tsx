import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ThemeToggle } from '@/components/ThemeToggle';
import { render, screen } from '../render';

const button = () => screen.getByRole('button', { name: 'Alternar tema' });

describe('ThemeToggle', () => {
  beforeEach(() => {
    delete document.documentElement.dataset.theme;
    document.cookie = 'theme=; max-age=0';
    delete (document as { startViewTransition?: unknown }).startViewTransition;
    vi.stubGlobal('matchMedia', () => ({ matches: false }));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('switches to dark when the system is light and remembers it in a cookie', () => {
    render(<ThemeToggle />);

    button().click();

    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(document.cookie).toContain('theme=dark');
  });

  it('switches back to light on the next click', () => {
    render(<ThemeToggle />);

    button().click();
    button().click();

    expect(document.documentElement.dataset.theme).toBe('light');
  });

  it('reveals the new theme in a circle from the click when view transitions are supported', async () => {
    const animate = vi.fn();
    document.documentElement.animate = animate;
    document.startViewTransition = vi.fn((update: () => void) => {
      update();
      return { ready: Promise.resolve() } as ViewTransition;
    });
    render(<ThemeToggle />);

    button().click();
    await Promise.resolve();

    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(animate).toHaveBeenCalledWith(
      {
        clipPath: [expect.stringMatching(/^circle\(0px at /), expect.stringMatching(/^circle\(\d/)],
      },
      expect.objectContaining({ pseudoElement: '::view-transition-new(root)' }),
    );
  });

  it('still applies the theme when the browser skips the transition', async () => {
    document.startViewTransition = vi.fn((update: () => void) => {
      update();
      return {
        ready: Promise.reject(new DOMException('skipped', 'InvalidStateError')),
      } as ViewTransition;
    });
    render(<ThemeToggle />);

    button().click();
    await Promise.resolve();

    expect(document.documentElement.dataset.theme).toBe('dark');
  });
});
