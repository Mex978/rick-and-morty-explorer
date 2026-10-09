import { createGlobalStyle } from 'styled-components';

import { palettes } from './theme';

const variables = (palette: typeof palettes.light) =>
  Object.entries(palette)
    .map(([name, value]) => `--color-${name}: ${value};`)
    .join('\n');

const darkTheme = `color-scheme: dark;\n${variables(palettes.dark)}`;

export const GlobalStyle = createGlobalStyle`
  :root {
    color-scheme: light;
    ${variables(palettes.light)}
  }

  :root[data-theme='dark'] {
    ${darkTheme}
  }

  @media (prefers-color-scheme: dark) {
    :root:not([data-theme='light']) {
      ${darkTheme}
    }
  }

  *, *::before, *::after {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    font-family: ${({ theme }) => theme.font};
    color: ${({ theme }) => theme.colors.text};
    background: ${({ theme }) => theme.colors.background};
    -webkit-font-smoothing: antialiased;
  }

  ::view-transition-old(root),
  ::view-transition-new(root) {
    animation: none;
    mix-blend-mode: normal;
  }

  :focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  main {
    max-width: ${({ theme }) => theme.maxWidth};
    margin: 0 auto;
    padding: 24px 16px 48px;
  }
`;
