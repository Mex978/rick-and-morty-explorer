import type { Episode } from '@rma/types';

export interface SeasonGroup {
  season: number;
  episodes: Episode[];
}

export interface EpisodesProps {
  seasons: SeasonGroup[];
}
