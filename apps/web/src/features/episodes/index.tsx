import type { Episode } from '@rma/types';
import { notFound } from 'next/navigation';

import { ApiError, getEpisodes } from '@/lib/api';

import type { SeasonGroup } from './data';
import { EpisodesLayout } from './Layout';

export async function Episodes({ page }: { page: number }) {
  const { info, results } = await getEpisodes(page).catch((error: unknown) => {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  });

  return (
    <EpisodesLayout
      seasons={groupBySeason(results)}
      pagination={{
        currentPage: info.currentPage,
        totalPages: info.pages,
        prevHref: info.hasPrev ? `/?page=${page - 1}` : null,
        nextHref: info.hasNext ? `/?page=${page + 1}` : null,
      }}
    />
  );
}

function groupBySeason(episodes: Episode[]): SeasonGroup[] {
  const groups = new Map<number, Episode[]>();

  for (const episode of episodes) {
    const season = Number(episode.code.slice(1, 3));
    groups.set(season, [...(groups.get(season) ?? []), episode]);
  }

  return [...groups].map(([season, episodes]) => ({ season, episodes }));
}
