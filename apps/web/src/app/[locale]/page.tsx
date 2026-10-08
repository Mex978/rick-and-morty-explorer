import { Episodes } from '@/features/episodes';

export default async function EpisodesPage({ searchParams }: { searchParams: Promise<{ page?: string; q?: string }> }) {
  const { page, q } = await searchParams;

  return <Episodes page={Number(page) || 1} query={q?.trim() ?? ''} />;
}
