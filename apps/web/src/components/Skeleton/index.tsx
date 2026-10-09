'use client';

import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';

import { Block, Card, Content, Grid, VisuallyHidden } from './styles';

export function Skeleton({ children }: { children: ReactNode }) {
  const t = useTranslations();

  return (
    <div role="status" aria-busy="true">
      <VisuallyHidden>{t('loading')}</VisuallyHidden>
      <Content aria-hidden="true">{children}</Content>
    </div>
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
