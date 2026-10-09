'use client';

import { useFormatter, useTranslations } from 'next-intl';
import { useEffect, useRef, useTransition } from 'react';

import { Pagination } from '@/components/Pagination';
import { SearchField } from '@/components/SearchField';
import { Link, useRouter } from '@/i18n/navigation';
import { formatAirDate } from '@/lib/air-date';

import type { EpisodesProps } from '../data';
import { Card, Code, Empty, Grid, Meta, Name, Results, Season, SeasonTitle, Title } from './styles';

const SEARCH_DEBOUNCE_MS = 300;

export function EpisodesLayout({ query, seasons, pagination }: EpisodesProps) {
  const t = useTranslations('episodes');
  const format = useFormatter();
  const { inputRef, search, isPending } = useSearch(query);

  return (
    <>
      <Title>{t('title')}</Title>
      <SearchField
        ref={inputRef}
        name="q"
        label={t('search.label')}
        placeholder={t('search.placeholder')}
        defaultValue={query}
        onChange={(event) => search(event.target.value, { immediate: event.target.value === '' })}
        onSubmit={(event) => {
          event.preventDefault();
          search(new FormData(event.currentTarget).get('q') as string, { immediate: true });
        }}
      />
      <Results aria-busy={isPending} $pending={isPending}>
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
                  {/* Prefetching every visible card would render ~20 details at once and trip the upstream rate limit. */}
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
        {seasons.length > 0 && <Pagination {...pagination} />}
      </Results>
    </>
  );
}

function useSearch(query: string) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  // The input is uncontrolled so typing never fights the url. Only pull the url value back in when the change
  // came from somewhere else (clear link, back button), otherwise the user's keystrokes would be overwritten.
  useEffect(() => {
    if (inputRef.current && document.activeElement !== inputRef.current)
      inputRef.current.value = query;
  }, [query]);

  function navigate(value: string) {
    const query = value.trim();
    startTransition(() => router.replace(query ? `/?${new URLSearchParams({ q: query })}` : '/'));
  }

  function search(value: string, { immediate }: { immediate: boolean }) {
    clearTimeout(timer.current);
    if (immediate) return navigate(value);
    timer.current = setTimeout(() => navigate(value), SEARCH_DEBOUNCE_MS);
  }

  return { inputRef, search, isPending };
}
