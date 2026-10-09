import type { Episode } from '@rma/types';

// The api rejects longer names with a 400; the input and the page both stop at this length.
export const MAX_QUERY_LENGTH = 100;

export interface SeasonGroup {
  season: number;
  episodes: Episode[];
}

export interface EpisodesProps {
  query: string;
  seasons: SeasonGroup[];
  page: number;
  pages: number;
}
