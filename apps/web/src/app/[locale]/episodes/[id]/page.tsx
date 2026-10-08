import type { Metadata } from 'next';

import { Episode } from '@/features/episode';
import { alternatesFor } from '@/i18n/metadata';
import { ApiError, getEpisode } from '@/lib/api';

interface Props {
  params: Promise<{ locale: string; id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, id } = await params;

  // Next dedupes this fetch with the one in the page, and a bad id is handled there with notFound().
  const episode = await getEpisode(Number(id)).catch((error: unknown) => {
    if (error instanceof ApiError) return null;
    throw error;
  });

  return episode ? { title: `${episode.code} · ${episode.name}`, alternates: alternatesFor(locale, `/episodes/${id}`) } : {};
}

export default async function EpisodePage({ params }: Props) {
  const { id } = await params;

  return <Episode id={Number(id)} />;
}
