import type { Episode } from '@rma/types';

import type { PaginationProps } from '@/components/Pagination';

export interface SeasonGroup {
  season: number;
  episodes: Episode[];
}

export interface EpisodesProps {
  query: string;
  seasons: SeasonGroup[];
  pagination: PaginationProps;
}
