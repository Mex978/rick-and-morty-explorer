'use client';

import { useFormatter, useTranslations } from 'next-intl';

import { Pagination } from '@/components/Pagination';
import { Link } from '@/i18n/navigation';
import { parseAirDate } from '@/lib/air-date';

import type { EpisodesProps } from '../data';
import {
  Card,
  Code,
  Empty,
  Grid,
  Meta,
  Name,
  SearchButton,
  SearchForm,
  SearchInput,
  Season,
  SeasonTitle,
  Title,
} from './styles';

export function EpisodesLayout({ query, seasons, pagination }: EpisodesProps) {
  const t = useTranslations('episodes');
  const format = useFormatter();

  return (
    <>
      <Title>{t('title')}</Title>
      <SearchForm role="search">
        <SearchInput
          type="search"
          name="q"
          defaultValue={query}
          placeholder={t('search.placeholder')}
          aria-label={t('search.label')}
          autoComplete="off"
        />
        <SearchButton type="submit">{t('search.submit')}</SearchButton>
      </SearchForm>
      {seasons.length === 0 && (
        <Empty>
          {t('empty', { query })} <Link href="/">{t('search.clear')}</Link>
        </Empty>
      )}
      {seasons.map(({ season, episodes }) => (
        <Season key={season} aria-labelledby={`season-${season}`}>
          <SeasonTitle id={`season-${season}`}>{t('season', { number: season })}</SeasonTitle>
          <Grid>
            {episodes.map((episode) => (
              <Card key={episode.id}>
                <Link href={`/episodes/${episode.id}`}>
                  <Code>{episode.code}</Code>
                  <Name>{episode.name}</Name>
                  <Meta>{format.dateTime(parseAirDate(episode.airDate), { dateStyle: 'long' })}</Meta>
                  <Meta>{t('characterCount', { count: episode.characterCount })}</Meta>
                </Link>
              </Card>
            ))}
          </Grid>
        </Season>
      ))}
      {seasons.length > 0 && <Pagination {...pagination} />}
    </>
  );
}
