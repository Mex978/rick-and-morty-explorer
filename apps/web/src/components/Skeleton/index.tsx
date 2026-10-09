'use client';

import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';

import { Block, Card, Grid, Status, VisuallyHidden } from './styles';

export function Skeleton({ children }: { children: ReactNode }) {
  const t = useTranslations();

  return (
    <Status role="status" aria-busy="true">
      <VisuallyHidden>{t('loading')}</VisuallyHidden>
      <div aria-hidden="true">{children}</div>
    </Status>
  );
}

export function SkeletonCards({
  count,
  min,
  children,
}: {
  count: number;
  min: string;
  children: ReactNode;
}) {
  return (
    <Grid $min={min}>
      {Array.from({ length: count }, (_, index) => (
        <Card key={index}>{children}</Card>
      ))}
    </Grid>
  );
}

export const SkeletonBlock = Block;
