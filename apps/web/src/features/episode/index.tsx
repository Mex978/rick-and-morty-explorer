import { notFound } from 'next/navigation';

import { getEpisode } from '@/lib/api';

import { EpisodeLayout } from './Layout';

export async function Episode({ id }: { id: number }) {
  const episode = await getEpisode(id);
  if (!episode) notFound();

  return <EpisodeLayout episode={episode} />;
}
