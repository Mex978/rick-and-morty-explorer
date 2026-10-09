import { Skeleton, SkeletonBlock, SkeletonCards } from '@/components/Skeleton';

export default function Loading() {
  return (
    <Skeleton>
      <SkeletonBlock $width="180px" $height="0.9rem" />
      <SkeletonBlock $width="72px" $height="1.4rem" $radius="999px" />
      <SkeletonBlock $width="320px" $height="2rem" />
      <SkeletonBlock $width="260px" $height="1rem" />
      <SkeletonBlock $width="110px" $height="0.8rem" />
      <SkeletonBlock $height="42px" />
      <SkeletonCards count={10} min="200px">
        <SkeletonBlock $height="160px" />
        <SkeletonBlock $width="70%" $height="1rem" />
        <SkeletonBlock $width="48px" $height="1.1rem" $radius="999px" />
        <SkeletonBlock $width="60%" $height="0.8rem" />
      </SkeletonCards>
      <SkeletonBlock $width="300px" $height="38px" $center />
    </Skeleton>
  );
}
