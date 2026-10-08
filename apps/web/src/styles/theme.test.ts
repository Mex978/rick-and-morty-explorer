import { describe, expect, it } from 'vitest';

import { isThemeName } from './theme';

describe('isThemeName', () => {
  it('accepts only the two known themes', () => {
    expect(isThemeName('dark')).toBe(true);
    expect(isThemeName('light')).toBe(true);
    expect(isThemeName('blue')).toBe(false);
    expect(isThemeName(undefined)).toBe(false);
  });
});
