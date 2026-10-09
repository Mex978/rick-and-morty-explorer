import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { Episodes } from '@/features/episodes';
import { alternatesFor } from '@/i18n/metadata';

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string | string[]; q?: string | string[] }>;
}

const first = (value?: string | string[]) => (Array.isArray(value) ? value[0] : value);

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
  const pageNumber = Number(first(page));

  if (!Number.isInteger(pageNumber) || pageNumber < 1) notFound();

  return <Episodes page={pageNumber} query={first(q)?.trim() ?? ''} />;
}
