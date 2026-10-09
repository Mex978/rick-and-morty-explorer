import { describe, expect, it } from 'vitest';

import { first, positiveInt } from '@/lib/params';

describe('params', () => {
  it('takes the first value of a repeated param', () => {
    expect(first(['2', '3'])).toBe('2');
    expect(first('2')).toBe('2');
    expect(first(undefined)).toBeUndefined();
  });

  it.each(['1', '42'])('accepts %s as a positive integer', (value) => {
    expect(positiveInt(value)).toBe(Number(value));
  });

  it.each(['0', '-1', '1.5', 'abc', '1e3', ' 1', '', undefined])('rejects %s', (value) => {
    expect(positiveInt(value)).toBeNull();
  });
});
