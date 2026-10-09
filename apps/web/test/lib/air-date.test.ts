import { describe, expect, it } from 'vitest';

import { formatAirDate, parseAirDate } from '@/lib/air-date';

const format = { dateTime: () => 'formatted' } as unknown as Parameters<typeof formatAirDate>[1];

describe('parseAirDate', () => {
  it('pins the calendar day to utc midnight', () => {
    expect(parseAirDate('December 2, 2013')?.toISOString()).toBe('2013-12-02T00:00:00.000Z');
  });

  it('returns null for a value it cannot parse', () => {
    expect(parseAirDate('unknown')).toBeNull();
  });
});

describe('formatAirDate', () => {
  it('formats a valid date', () => {
    expect(formatAirDate('December 2, 2013', format)).toBe('formatted');
  });

  it('falls back to the raw value when the date cannot be parsed', () => {
    expect(formatAirDate('unknown', format)).toBe('unknown');
  });
});
