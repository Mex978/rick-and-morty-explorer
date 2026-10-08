import { useTranslations } from 'next-intl';

export default function EpisodesPage() {
  const t = useTranslations('episodes');

  return <h1>{t('title')}</h1>;
}
