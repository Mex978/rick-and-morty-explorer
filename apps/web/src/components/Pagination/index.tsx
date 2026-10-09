'use client';

import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { usePathname } from '@/i18n/navigation';

import { Nav, PageButton, PageLink, Status } from './styles';

interface PaginationProps {
  page: number;
  pages: number;
  // Without it the controls are links that put the page in the url; with it they are buttons
  // and the caller owns the page, for lists that are already fully loaded.
  onChange?: (page: number) => void;
}

export function Pagination({ page, pages, onChange }: PaginationProps) {
  const t = useTranslations('pagination');
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const href = (target: number) => ({
    pathname,
    query: { ...Object.fromEntries(searchParams), page: target },
  });

  const control = (target: number, label: string, enabled: boolean) => {
    if (onChange) {
      return (
        <PageButton type="button" disabled={!enabled} onClick={() => onChange(target)}>
          {label}
        </PageButton>
      );
    }
    return enabled ? (
      <PageLink href={href(target)}>{label}</PageLink>
    ) : (
      <PageButton type="button" disabled>
        {label}
      </PageButton>
    );
  };

  return (
    <Nav aria-label={t('label')}>
      {control(page - 1, t('previous'), page > 1)}
      <Status aria-live="polite">{t('page', { current: page, total: pages })}</Status>
      {control(page + 1, t('next'), page < pages)}
    </Nav>
  );
}
