import { Skeleton, SkeletonBlock, SkeletonCards } from '@/components/Skeleton';

export default function Loading() {
  return (
    <Skeleton>
      <SkeletonBlock $width="220px" $height="2rem" />
      <SkeletonBlock $height="42px" />
      <SkeletonBlock $width="120px" $height="0.8rem" />
      <SkeletonCards count={6} min="240px">
        <SkeletonBlock $width="64px" $height="1.2rem" $radius="999px" />
        <SkeletonBlock $width="70%" $height="1.1rem" />
        <SkeletonBlock $width="55%" $height="0.85rem" />
        <SkeletonBlock $width="40%" $height="0.85rem" />
      </SkeletonCards>
    </Skeleton>
  );
}
