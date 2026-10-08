import type { Metadata } from 'next';

import { routing } from './routing';

export function alternatesFor(locale: string, path = ''): Metadata['alternates'] {
  return {
    canonical: `/${locale}${path}`,
    languages: Object.fromEntries(routing.locales.map((option) => [option, `/${option}${path}`])),
  };
}
