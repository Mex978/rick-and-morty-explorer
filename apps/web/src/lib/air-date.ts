import type { useFormatter } from 'next-intl';

// The API sends air dates as a plain calendar day ("December 2, 2013"). Pinning it to UTC midnight
// keeps it on the same day whatever the time zone of the server or the browser rendering it.
export function parseAirDate(airDate: string): Date | null {
  const local = new Date(airDate);
  if (Number.isNaN(local.getTime())) return null;

  return new Date(Date.UTC(local.getFullYear(), local.getMonth(), local.getDate()));
}

export function formatAirDate(airDate: string, format: ReturnType<typeof useFormatter>): string {
  const date = parseAirDate(airDate);
  return date ? format.dateTime(date, { dateStyle: 'long' }) : airDate;
}
