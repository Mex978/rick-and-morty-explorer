import type { useFormatter } from 'next-intl';

// Air dates are calendar days ("December 2, 2013"); UTC midnight keeps them on that day in any time zone.
export function parseAirDate(airDate: string): Date | null {
  const local = new Date(airDate);
  if (Number.isNaN(local.getTime())) return null;

  return new Date(Date.UTC(local.getFullYear(), local.getMonth(), local.getDate()));
}

export function formatAirDate(airDate: string, format: ReturnType<typeof useFormatter>): string {
  const date = parseAirDate(airDate);
  return date ? format.dateTime(date, { dateStyle: 'long' }) : airDate;
}
