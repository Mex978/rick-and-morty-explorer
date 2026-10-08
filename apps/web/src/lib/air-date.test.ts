import { describe, expect, it } from 'vitest';

import { parseAirDate } from './air-date';

describe('parseAirDate', () => {
  it('pins the calendar day to utc midnight', () => {
    expect(parseAirDate('December 2, 2013').toISOString()).toBe('2013-12-02T00:00:00.000Z');
  });
});
