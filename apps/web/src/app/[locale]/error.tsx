'use client';

import { useTranslations } from 'next-intl';

import { Action, Centered, Description, Heading } from './styles';

export default function RouteError({ reset }: { error: Error; reset: () => void }) {
  const t = useTranslations('error');

  return (
    <Centered>
      <Heading>{t('title')}</Heading>
      <Description>{t('description')}</Description>
      <Action onClick={reset}>{t('retry')}</Action>
    </Centered>
  );
}
