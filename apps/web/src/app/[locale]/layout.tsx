import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getTranslations } from 'next-intl/server';

import { Header } from '@/components/Header';
import { routing } from '@/i18n/routing';
import { StyledComponentsRegistry } from '@/lib/registry';
import { isThemeName, THEME_COOKIE } from '@/styles/theme';

interface Props {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'app' });

  return {
    metadataBase: new URL(process.env.SITE_URL ?? 'http://localhost:3000'),
    title: { default: t('title'), template: `%s · ${t('title')}` },
    description: t('description'),
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const savedTheme = (await cookies()).get(THEME_COOKIE)?.value;

  return (
    <html lang={locale} data-theme={isThemeName(savedTheme) ? savedTheme : undefined}>
      <body>
        <StyledComponentsRegistry>
          <NextIntlClientProvider>
            <Header />
            <main>{children}</main>
          </NextIntlClientProvider>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
