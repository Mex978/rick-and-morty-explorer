import type { Metadata } from 'next';

import { Episode } from '@/features/episode';
import { alternatesFor } from '@/i18n/metadata';
import { getEpisode } from '@/lib/api';

interface Props {
  params: Promise<{ locale: string; id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, id } = await params;
  const episode = await getEpisode(Number(id));

  if (!episode) return {};

  return {
    title: `${episode.code} · ${episode.name}`,
    alternates: alternatesFor(locale, `/episodes/${id}`),
  };
}

export default async function EpisodePage({ params }: Props) {
  const { id } = await params;

  return <Episode id={Number(id)} />;
}
