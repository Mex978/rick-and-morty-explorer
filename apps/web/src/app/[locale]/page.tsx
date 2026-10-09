import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { Episodes } from '@/features/episodes';
import { MAX_QUERY_LENGTH } from '@/features/episodes/data';
import { alternatesFor } from '@/i18n/metadata';
import { first, positiveInt } from '@/lib/params';

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string | string[]; q?: string | string[] }>;
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { locale } = await params;
  const { page = '1', q } = await searchParams;
  const t = await getTranslations({ locale, namespace: 'episodes' });

  return {
    title: t('title'),
    alternates: alternatesFor(locale, first(page) === '1' ? '' : `?page=${first(page)}`),
    robots: q ? { index: false } : undefined,
  };
}

export default async function EpisodesPage({ searchParams }: Props) {
  const { page = '1', q = '' } = await searchParams;
  const pageNumber = positiveInt(first(page));

  if (pageNumber === null) notFound();

  return <Episodes page={pageNumber} query={(first(q) ?? '').trim().slice(0, MAX_QUERY_LENGTH)} />;
}
