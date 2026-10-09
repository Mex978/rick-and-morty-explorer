import type { MouseEvent } from 'react';

import { THEME_COOKIE } from '@/styles/theme';

const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;
const REVEAL_DURATION_MS = 500;

export function toggleTheme(event: MouseEvent<HTMLElement>) {
  const root = document.documentElement;
  const current =
    root.dataset.theme ?? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  const next = current === 'dark' ? 'light' : 'dark';
  const apply = () => {
    root.dataset.theme = next;
  };

  const secure = location.protocol === 'https:' ? '; secure' : '';
  document.cookie = `${THEME_COOKIE}=${next}; path=/; max-age=${COOKIE_MAX_AGE_SECONDS}; samesite=lax${secure}`;

  if (!document.startViewTransition || matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return apply();
  }

  revealFrom(event.clientX, event.clientY, apply);
}

function revealFrom(x: number, y: number, apply: () => void) {
  const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));

  document
    .startViewTransition(apply)
    .ready.then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        {
          duration: REVEAL_DURATION_MS,
          easing: 'ease-in-out',
          pseudoElement: '::view-transition-new(root)',
        },
      );
    })
    .catch(() => {
      // Skipped transition (hidden tab, another one running): the theme is applied anyway.
    });
}
