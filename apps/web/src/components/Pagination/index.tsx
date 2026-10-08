'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { Nav, PageLink, Status } from './styles';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  prevHref: string | null;
  nextHref: string | null;
}

export function Pagination({ currentPage, totalPages, prevHref, nextHref }: PaginationProps) {
  const t = useTranslations('pagination');

  return (
    <Nav aria-label={t('page', { current: currentPage, total: totalPages })}>
      {prevHref ? (
        <PageLink as={Link} href={prevHref}>
          {t('previous')}
        </PageLink>
      ) : (
        <PageLink $disabled aria-disabled="true">
          {t('previous')}
        </PageLink>
      )}
      <Status>{t('page', { current: currentPage, total: totalPages })}</Status>
      {nextHref ? (
        <PageLink as={Link} href={nextHref}>
          {t('next')}
        </PageLink>
      ) : (
        <PageLink $disabled aria-disabled="true">
          {t('next')}
        </PageLink>
      )}
    </Nav>
  );
}
