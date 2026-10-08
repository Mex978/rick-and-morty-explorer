import { notFound } from 'next/navigation';

import { ApiError, getEpisode } from '@/lib/api';

import { EpisodeLayout } from './Layout';

export async function Episode({ id }: { id: number }) {
  if (!Number.isInteger(id) || id < 1) notFound();

  const episode = await getEpisode(id).catch((error: unknown) => {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  });

  return <EpisodeLayout episode={episode} />;
}
