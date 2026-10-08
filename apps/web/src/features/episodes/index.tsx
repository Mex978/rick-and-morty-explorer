import type { Episode } from '@rma/types';
import { notFound } from 'next/navigation';

import { ApiError, getEpisodes } from '@/lib/api';

import type { SeasonGroup } from './data';
import { EpisodesLayout } from './Layout';

export async function Episodes({ page, query }: { page: number; query: string }) {
  const { info, results } = await getEpisodes(page, query).catch((error: unknown) => {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  });

  const hrefFor = (target: number) => {
    const params = new URLSearchParams({ page: String(target) });
    if (query) params.set('q', query);
    return `/?${params}`;
  };

  return (
    <EpisodesLayout
      query={query}
      seasons={groupBySeason(results)}
      pagination={{
        currentPage: info.currentPage,
        totalPages: info.pages,
        prevHref: info.hasPrev ? hrefFor(page - 1) : null,
        nextHref: info.hasNext ? hrefFor(page + 1) : null,
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
