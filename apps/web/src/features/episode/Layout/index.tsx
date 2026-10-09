'use client';

import type { Character } from '@rma/types';
import Image from 'next/image';
import { useFormatter, useTranslations } from 'next-intl';
import { useState } from 'react';

import { SearchField } from '@/components/SearchField';
import { Link } from '@/i18n/navigation';
import { formatAirDate } from '@/lib/air-date';

import type { EpisodeProps } from '../data';
import {
  AvatarFallback,
  BackLink,
  Badge,
  Card,
  CardBody,
  Code,
  Detail,
  Empty,
  Grid,
  Meta,
  Name,
  SectionTitle,
  Title,
} from './styles';

const AVATAR_RETRIES = 2;
// The upstream answers bursts with 429 and a retry-after of about ten seconds, so retries wait long enough to matter.
const AVATAR_RETRY_DELAYS_MS = [4000, 8000];

export function EpisodeLayout({ episode }: EpisodeProps) {
  const t = useTranslations('episode');
  const format = useFormatter();
  const [query, setQuery] = useState('');
  const characters = filterByName(episode.characters, query);

  return (
    <>
      <BackLink as={Link} href="/">
        ← {t('back')}
      </BackLink>
      <Code>{episode.code}</Code>
      <Title>{episode.name}</Title>
      <Meta>
        {t('airDate', { date: formatAirDate(episode.airDate, format) })}
        {' · '}
        {t('characterCount', { count: episode.characterCount })}
      </Meta>
      <SectionTitle>{t('characters')}</SectionTitle>
      <SearchField
        label={t('search.label')}
        placeholder={t('search.placeholder')}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      {characters.length === 0 && <Empty>{t('empty', { query })}</Empty>}
      <Grid>
        {characters.map((character, index) => (
          <CharacterCard key={character.id} character={character} priority={index < 4} />
        ))}
      </Grid>
    </>
  );
}

function filterByName(characters: Character[], query: string): Character[] {
  const needle = query.trim().toLocaleLowerCase();
  return needle
    ? characters.filter((character) => character.name.toLocaleLowerCase().includes(needle))
    : characters;
}

function CharacterCard({ character, priority }: { character: Character; priority: boolean }) {
  const t = useTranslations('character');
  const status = toStatusKey(character.status);

  return (
    <Card>
      <CharacterAvatar character={character} priority={priority} />
      <CardBody>
        <Name>{character.name}</Name>
        <Badge $status={status}>{t(`status.${status}`)}</Badge>
        <Detail>
          <dt>{t('species')}</dt>
          <dd>{character.species}</dd>
          <dt>{t('origin')}</dt>
          <dd>{character.origin}</dd>
          <dt>{t('location')}</dt>
          <dd>{character.location}</dd>
        </Detail>
      </CardBody>
    </Card>
  );
}

// A page with 60 avatars is a burst for the upstream CDN. A failed image gets delayed retries (a new query
// string forces the browser to fetch again) and then a placeholder instead of a broken icon.
function CharacterAvatar({ character, priority }: { character: Character; priority: boolean }) {
  const [attempt, setAttempt] = useState(0);
  const [failed, setFailed] = useState(false);

  if (failed)
    return <AvatarFallback aria-label={character.name}>{character.name.charAt(0)}</AvatarFallback>;

  return (
    <Image
      src={attempt === 0 ? character.image : `${character.image}?retry=${attempt}`}
      alt={character.name}
      width={300}
      height={300}
      priority={priority}
      onError={() => {
        if (attempt >= AVATAR_RETRIES) return setFailed(true);
        setTimeout(() => setAttempt(attempt + 1), AVATAR_RETRY_DELAYS_MS[attempt]);
      }}
    />
  );
}

function toStatusKey(status: string): 'alive' | 'dead' | 'unknown' {
  const key = status.toLowerCase();
  return key === 'alive' || key === 'dead' ? key : 'unknown';
}
