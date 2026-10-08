'use client';

import { useTranslations } from 'next-intl';

import { Centered, Description } from './styles';

export default function Loading() {
  const t = useTranslations();

  return (
    <Centered role="status">
      <Description>{t('loading')}</Description>
    </Centered>
  );
}
