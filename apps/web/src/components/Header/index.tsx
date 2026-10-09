'use client';

import { useSearchParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';

import { ThemeToggle } from '@/components/ThemeToggle';
import { Link, usePathname } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';

import { Actions, Bar, Brand, Inner, LocaleLink, Locales } from './styles';

export function Header() {
  const t = useTranslations('app');
  const locale = useLocale();
  const pathname = usePathname();
  const query = Object.fromEntries(useSearchParams());

  return (
    <Bar>
      <Inner>
        <Link href="/">
          <Brand>{t('title')}</Brand>
        </Link>
        <Actions>
          <Locales aria-label={t('language')}>
            {routing.locales.map((option) => (
              <LocaleLink
                key={option}
                as={Link}
                href={{ pathname, query }}
                locale={option}
                hrefLang={option}
                aria-label={t(`locales.${option}`)}
                $active={option === locale}
                aria-current={option === locale ? 'true' : undefined}
              >
                {option}
              </LocaleLink>
            ))}
          </Locales>
          <ThemeToggle />
        </Actions>
      </Inner>
    </Bar>
  );
}
