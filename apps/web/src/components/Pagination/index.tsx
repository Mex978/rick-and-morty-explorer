'use client';

import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { usePathname } from '@/i18n/navigation';

import { Nav, PageButton, PageLink, Status } from './styles';

export function Pagination({ page, pages }: { page: number; pages: number }) {
  const t = useTranslations('pagination');
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const href = (target: number) => ({
    pathname,
    query: { ...Object.fromEntries(searchParams), page: target },
  });

  return (
    <Nav aria-label={t('label')}>
      {page > 1 ? (
        <PageLink href={href(page - 1)}>{t('previous')}</PageLink>
      ) : (
        <PageButton disabled>{t('previous')}</PageButton>
      )}
      <Status>{t('page', { current: page, total: pages })}</Status>
      {page < pages ? (
        <PageLink href={href(page + 1)}>{t('next')}</PageLink>
      ) : (
        <PageButton disabled>{t('next')}</PageButton>
      )}
    </Nav>
  );
}
