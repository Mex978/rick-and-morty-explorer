import type { Episode, EpisodeDetail, Paginated } from '@rma/types';

// What this module needs from wherever episodes come from, in its own terms. The rick-and-morty
// module binds the implementation; nothing here knows how the upstream shapes or paginates data.
export interface EpisodeSource {
  // A search with no matches is an empty first page; a page past the last one does not exist.
  listEpisodes(page: number, name?: string): Promise<Paginated<Episode>>;
  // Characters come in whatever order the source keeps them.
  getEpisodeDetail(id: number): Promise<EpisodeDetail>;
}

export const EPISODE_SOURCE = Symbol('EpisodeSource');
