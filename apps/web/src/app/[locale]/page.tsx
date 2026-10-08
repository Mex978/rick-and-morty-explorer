import { Episodes } from '@/features/episodes';

export default async function EpisodesPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page } = await searchParams;

  return <Episodes page={Number(page) || 1} />;
}
