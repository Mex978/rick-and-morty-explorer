export const theme = {
  colors: {
    background: '#f6f7f9',
    surface: '#ffffff',
    border: '#e3e6ea',
    text: '#1c1f24',
    muted: '#5f6670',
    primary: '#0b7a75',
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
