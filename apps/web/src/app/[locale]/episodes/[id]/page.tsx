import { Episode } from '@/features/episode';

export default async function EpisodePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return <Episode id={Number(id)} />;
}
