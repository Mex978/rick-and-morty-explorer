// The API sends air dates as a plain calendar day ("December 2, 2013"). Pinning it to UTC midnight
// keeps it on the same day whatever the time zone of the server or the browser rendering it.
export function parseAirDate(airDate: string): Date {
  const local = new Date(airDate);
  return new Date(Date.UTC(local.getFullYear(), local.getMonth(), local.getDate()));
}
