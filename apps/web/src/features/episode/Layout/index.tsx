'use client';

import type { Character } from '@rma/types';
import Image from 'next/image';
import { useFormatter, useTranslations } from 'next-intl';
import { useRef, useState } from 'react';

import { Pagination } from '@/components/Pagination';
import { SearchField } from '@/components/SearchField';
import { Link } from '@/i18n/navigation';
import { formatAirDate } from '@/lib/air-date';

import type { EpisodeProps } from '../data';
import { useAvatar } from '../useAvatar';
import type { CharacterStatus } from './styles';
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

const EAGER_AVATARS = 4;
// Caps how many avatars a visit asks the upstream CDN for at once, whatever the screen size,
// and fills the five columns of the desktop grid twice.
const PAGE_SIZE = 10;

export function EpisodeLayout({ episode }: EpisodeProps) {
  const t = useTranslations('episode');
  const format = useFormatter();
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const section = useRef<HTMLHeadingElement>(null);

  // The filter always runs over every character; only the result is paged.
  const matches = filterByName(episode.characters, query);
  const pages = Math.max(1, Math.ceil(matches.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const characters = matches.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  const search = (value: string) => {
    setQuery(value);
    setPage(1);
  };

  const goTo = (target: number) => {
    setPage(target);
    section.current?.scrollIntoView?.({ block: 'start' });
  };

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
      <SectionTitle ref={section}>{t('characters')}</SectionTitle>
      <SearchField
        label={t('search.label')}
        placeholder={t('search.placeholder')}
        value={query}
        onChange={(event) => search(event.target.value)}
      />
      {matches.length === 0 && <Empty>{t('empty', { query })}</Empty>}
      <Grid>
        {characters.map((character, index) => (
          <CharacterCard key={character.id} character={character} eager={index < EAGER_AVATARS} />
        ))}
      </Grid>
      {pages > 1 && <Pagination page={current} pages={pages} onChange={goTo} />}
    </>
  );
}

function filterByName(characters: Character[], query: string) {
  const needle = query.trim().toLocaleLowerCase();
  return needle
    ? characters.filter((c) => c.name.toLocaleLowerCase().includes(needle))
    : characters;
}

function CharacterCard({ character, eager }: { character: Character; eager: boolean }) {
  const t = useTranslations('character');
  const status = statusKey(character.status);

  return (
    <Card>
      <Avatar character={character} eager={eager} />
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

function Avatar({ character, eager }: { character: Character; eager: boolean }) {
  const { src, failed, retry } = useAvatar(character.image);

  if (failed) {
    return (
      <AvatarFallback role="img" aria-label={character.name}>
        {character.name[0]}
      </AvatarFallback>
    );
  }

  return (
    <Image
      src={src}
      alt={character.name}
      width={300}
      height={300}
      priority={eager}
      onError={retry}
    />
  );
}

function statusKey(status: string): CharacterStatus {
  const key = status.toLowerCase();
  return key === 'alive' || key === 'dead' ? key : 'unknown';
}
