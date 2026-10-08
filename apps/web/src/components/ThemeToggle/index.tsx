'use client';

import { useTranslations } from 'next-intl';
import type { MouseEvent } from 'react';

import { THEME_STORAGE_KEY } from '@/styles/theme';

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

    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Storage can be blocked (private mode); the theme still applies for this page.
    }

    if (!document.startViewTransition || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      apply();
      return;
    }

    const { clientX: x, clientY: y } = event;
    const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));

    void document.startViewTransition(apply).ready.then(() => {
      root.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: 500, easing: 'ease-in-out', pseudoElement: '::view-transition-new(root)' },
      );
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
