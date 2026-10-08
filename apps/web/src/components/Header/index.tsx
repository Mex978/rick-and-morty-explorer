'use client';

import { useLocale, useTranslations } from 'next-intl';

import { Link, usePathname } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';

import { Bar, Brand, Inner, LocaleLink, Locales } from './styles';

export function Header() {
  const t = useTranslations('app');
  const locale = useLocale();
  const pathname = usePathname();

  return (
    <Bar>
      <Inner>
        <Link href="/">
          <Brand>{t('title')}</Brand>
        </Link>
        <Locales aria-label={t('language')}>
          {routing.locales.map((option) => (
            <LocaleLink
              key={option}
              as={Link}
              href={pathname}
              locale={option}
              $active={option === locale}
              aria-current={option === locale ? 'true' : undefined}
            >
              {option}
            </LocaleLink>
          ))}
        </Locales>
      </Inner>
    </Bar>
  );
}
