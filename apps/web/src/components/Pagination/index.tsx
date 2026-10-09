'use client';

import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { usePathname } from '@/i18n/navigation';

import { Current, Gap, Nav, PageButton, PageLink, Pages, Status } from './styles';

interface PaginationProps {
  page: number;
  pages: number;
  // Without it the controls are links that put the page in the url; with it they are buttons
  // and the caller owns the page, for lists that are already fully loaded.
  onChange?: (page: number) => void;
}

// Pages shown as numbers: all of them while they fit, otherwise the first, the last and the
// neighbours of the current one, with a gap where pages are skipped.
const MAX_NUMBERS = 7;

export function Pagination({ page, pages, onChange }: PaginationProps) {
  const t = useTranslations('pagination');
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const href = (target: number) => ({
    pathname,
    query: { ...Object.fromEntries(searchParams), page: target },
  });

  const control = (target: number, label: string, enabled: boolean, ariaLabel?: string) => {
    if (onChange) {
      return (
        <PageButton
          type="button"
          disabled={!enabled}
          aria-label={ariaLabel}
          onClick={() => onChange(target)}
        >
          {label}
        </PageButton>
      );
    }
    return enabled ? (
      <PageLink href={href(target)} aria-label={ariaLabel}>
        {label}
      </PageLink>
    ) : (
      <PageButton type="button" disabled aria-label={ariaLabel}>
        {label}
      </PageButton>
    );
  };

  return (
    <Nav aria-label={t('label')}>
      {control(page - 1, t('previous'), page > 1)}
      <Pages>
        {pageWindow(page, pages).map((item, index) =>
          item === 'gap' ? (
            <Gap key={`gap-${index}`} aria-hidden="true">
              …
            </Gap>
          ) : item === page ? (
            <Current key={item} aria-current="page">
              {item}
            </Current>
          ) : (
            <li key={item}>{control(item, String(item), true, t('goTo', { page: item }))}</li>
          ),
        )}
      </Pages>
      <Status aria-live="polite">{t('page', { current: page, total: pages })}</Status>
      {control(page + 1, t('next'), page < pages)}
    </Nav>
  );
}

export function pageWindow(current: number, total: number): Array<number | 'gap'> {
  if (total <= MAX_NUMBERS) return Array.from({ length: total }, (_, index) => index + 1);

  const shown = [1, total, current - 1, current, current + 1].filter((p) => p >= 1 && p <= total);
  const sorted = [...new Set(shown)].sort((a, b) => a - b);

  return sorted.flatMap((p, index) => {
    const previous = sorted[index - 1];
    if (previous === undefined || p === previous + 1) return [p];
    return p === previous + 2 ? [previous + 1, p] : ['gap', p];
  });
}
