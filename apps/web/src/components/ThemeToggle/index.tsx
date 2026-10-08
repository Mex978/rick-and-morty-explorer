'use client';

import { useTranslations } from 'next-intl';
import type { MouseEvent } from 'react';

import { THEME_COOKIE } from '@/styles/theme';

import { Button, Moon, Sun } from './styles';

const icon = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2 };

export function ThemeToggle() {
  const t = useTranslations('app');

  function toggle(event: MouseEvent<HTMLButtonElement>) {
    const root = document.documentElement;
    const current = root.dataset.theme ?? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    const next = current === 'dark' ? 'light' : 'dark';

    const apply = () => {
      root.dataset.theme = next;
    };

    // A cookie, not localStorage, so the server renders the chosen theme and the page never flashes the other one.
    document.cookie = `${THEME_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;

    if (!document.startViewTransition || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      apply();
      return;
    }

    const { clientX: x, clientY: y } = event;
    const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));

    document
      .startViewTransition(apply)
      .ready.then(() => {
        root.animate(
          { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
          { duration: 500, easing: 'ease-in-out', pseudoElement: '::view-transition-new(root)' },
        );
      })
      .catch(() => {
        // The browser skips the transition in a hidden tab or when another one is running; the theme is applied anyway.
      });
  }

  return (
    <Button type="button" onClick={toggle} aria-label={t('theme')} title={t('theme')}>
      <Sun aria-hidden="true" {...icon}>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
      </Sun>
      <Moon aria-hidden="true" {...icon}>
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </Moon>
    </Button>
  );
}
