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

export const THEME_STORAGE_KEY = 'theme';

// Runs inline before the first paint so a saved preference never flashes the other theme on load.
export const themeScript = `try{var t=localStorage.getItem('${THEME_STORAGE_KEY}');if(t)document.documentElement.dataset.theme=t}catch(e){}`;

export const theme = {
  colors: {
    background: 'var(--color-background)',
    surface: 'var(--color-surface)',
    border: 'var(--color-border)',
    text: 'var(--color-text)',
    muted: 'var(--color-muted)',
    primary: 'var(--color-primary)',
    status: {
      alive: '#2e9e5b',
      dead: '#d0453b',
      unknown: '#8a929c',
    },
  },
  radius: '10px',
  maxWidth: '1100px',
  font: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
};

export type Theme = typeof theme;
