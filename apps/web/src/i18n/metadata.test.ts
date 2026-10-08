import { describe, expect, it } from 'vitest';

import { alternatesFor } from './metadata';

describe('alternatesFor', () => {
  it('points the canonical and every language to the same page', () => {
    expect(alternatesFor('en', '/episodes/1')).toEqual({
      canonical: '/en/episodes/1',
      languages: { 'pt-BR': '/pt-BR/episodes/1', en: '/en/episodes/1' },
    });
  });
});
