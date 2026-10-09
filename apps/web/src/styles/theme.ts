const light = {
  background: '#f6f7f9',
  surface: '#ffffff',
  border: '#e3e6ea',
  text: '#1c1f24',
  muted: '#5f6670',
  primary: '#0b7a75',
};

const dark: typeof light = {
  background: '#0f1216',
  surface: '#171b21',
  border: '#262c35',
  text: '#e7eaef',
  muted: '#98a1ac',
  primary: '#3fc1b9',
};

export const palettes = { light, dark };

export const THEME_COOKIE = 'theme';

type ThemeName = keyof typeof palettes;

export function isThemeName(value: unknown): value is ThemeName {
  return value === 'light' || value === 'dark';
}

export const theme = {
  colors: {
    background: 'var(--color-background)',
    surface: 'var(--color-surface)',
    border: 'var(--color-border)',
    text: 'var(--color-text)',
    muted: 'var(--color-muted)',
    primary: 'var(--color-primary)',
    status: {
      alive: '#1f7a45',
      dead: '#b93a31',
      unknown: '#5f6670',
    },
  },
  radius: '10px',
  maxWidth: '1100px',
  font: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
};

export type Theme = typeof theme;
