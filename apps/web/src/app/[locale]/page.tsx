import { notFound } from 'next/navigation';

import { Episodes } from '@/features/episodes';

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

export default async function EpisodesPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = first(params.page) === undefined ? 1 : Number(first(params.page));
  const query = first(params.q)?.trim() ?? '';

  if (!Number.isInteger(page) || page < 1) notFound();

  return <Episodes page={page} query={query} />;
}
