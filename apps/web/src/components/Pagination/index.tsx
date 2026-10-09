'use client';

import { useTranslations } from 'next-intl';

import { Nav, PageButton, PageLink, Status } from './styles';

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
        <PageLink href={prevHref}>{t('previous')}</PageLink>
      ) : (
        <PageButton disabled>{t('previous')}</PageButton>
      )}
      <Status>{t('page', { current: currentPage, total: totalPages })}</Status>
      {nextHref ? (
        <PageLink href={nextHref}>{t('next')}</PageLink>
      ) : (
        <PageButton disabled>{t('next')}</PageButton>
      )}
    </Nav>
  );
}
