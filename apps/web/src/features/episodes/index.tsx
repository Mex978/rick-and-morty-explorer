import type { Episode } from '@rma/types';
import { notFound } from 'next/navigation';

import { getEpisodes } from '@/lib/api';

import type { SeasonGroup } from './data';
import { EpisodesLayout } from './Layout';

export async function Episodes({ page, query }: { page: number; query: string }) {
  const episodes = await getEpisodes(page, query);
  if (!episodes) notFound();

  return (
    <EpisodesLayout
      query={query}
      seasons={groupBySeason(episodes.results)}
      page={page}
      pages={episodes.info.pages}
    />
  );
}

function groupBySeason(episodes: Episode[]): SeasonGroup[] {
  const bySeason = Map.groupBy(episodes, (episode) => Number(episode.code.slice(1, 3)));

  return [...bySeason].map(([season, episodes]) => ({ season, episodes }));
}
