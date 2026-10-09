import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { Episode } from '@/features/episode';
import { alternatesFor } from '@/i18n/metadata';
import { getEpisode } from '@/lib/api';
import { positiveInt } from '@/lib/params';

interface Props {
  params: Promise<{ locale: string; id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, id } = await params;
  const episodeId = positiveInt(id);
  const episode = episodeId === null ? null : await getEpisode(episodeId);

  if (!episode) return {};

  return {
    title: `${episode.code} · ${episode.name}`,
    alternates: alternatesFor(locale, `/episodes/${id}`),
  };
}

export default async function EpisodePage({ params }: Props) {
  const { id } = await params;
  const episodeId = positiveInt(id);

  if (episodeId === null) notFound();

  return <Episode id={episodeId} />;
}
