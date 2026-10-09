import { render as baseRender } from '@testing-library/react';
import type { RenderResult } from '@testing-library/react';
import type { ReactElement } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { ThemeProvider } from 'styled-components';

import messages from '@/messages/pt-BR.json';
import { theme } from '@/styles/theme';

export { screen, within, fireEvent, act } from '@testing-library/react';

export function render(ui: ReactElement): RenderResult {
  return baseRender(ui, {
    wrapper: ({ children }) => (
      <NextIntlClientProvider locale="pt-BR" messages={messages} timeZone="UTC">
        <ThemeProvider theme={theme}>{children}</ThemeProvider>
      </NextIntlClientProvider>
    ),
  });
}
