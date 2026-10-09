'use client';

import { useFormatter, useTranslations } from 'next-intl';

import { Pagination } from '@/components/Pagination';
import { SearchField } from '@/components/SearchField';
import { Link } from '@/i18n/navigation';
import { formatAirDate } from '@/lib/air-date';

import { MAX_QUERY_LENGTH } from '../data';
import type { EpisodesProps } from '../data';
import { useEpisodeSearch } from '../useEpisodeSearch';
import { Card, Code, Empty, Grid, Meta, Name, Results, Season, SeasonTitle, Title } from './styles';

export function EpisodesLayout({ query, seasons, page, pages }: EpisodesProps) {
  const t = useTranslations('episodes');
  const format = useFormatter();
  const { input, search, searchNow, isPending } = useEpisodeSearch(query);

  return (
    <>
      <Title>{t('title')}</Title>
      <SearchField
        ref={input}
        name="q"
        label={t('search.label')}
        placeholder={t('search.placeholder')}
        defaultValue={query}
        maxLength={MAX_QUERY_LENGTH}
        onChange={(event) => (event.target.value ? search(event.target.value) : searchNow(''))}
        onSubmit={(event) => {
          event.preventDefault();
          searchNow(input.current?.value ?? '');
        }}
      />
      <Results aria-busy={isPending} $busy={isPending}>
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
                  {/* A viewport prefetch of an episode runs its generateMetadata, which needs the episode
                      itself, so twenty visible cards would be twenty upstream calls at once. */}
                  <Link href={`/episodes/${episode.id}`} prefetch={false}>
                    <Code>{episode.code}</Code>
                    <Name>{episode.name}</Name>
                    <Meta>{formatAirDate(episode.airDate, format)}</Meta>
                    <Meta>{t('characterCount', { count: episode.characterCount })}</Meta>
                  </Link>
                </Card>
              ))}
            </Grid>
          </Season>
        ))}
        {seasons.length > 0 && <Pagination page={page} pages={pages} />}
      </Results>
    </>
  );
}
