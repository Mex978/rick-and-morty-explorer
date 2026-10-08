'use client';

import { useTranslations } from 'next-intl';

import { Link } from '@/i18n/navigation';

import { Action, Centered, Description, Heading } from './styles';

export default function NotFound() {
  const t = useTranslations('notFound');

  return (
    <Centered>
      <Heading>{t('title')}</Heading>
      <Description>{t('description')}</Description>
      <Action as={Link} href="/">
        {t('home')}
      </Action>
    </Centered>
  );
}
