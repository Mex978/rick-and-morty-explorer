'use client';

import type { Character } from '@rma/types';
import Image from 'next/image';
import { useFormatter, useTranslations } from 'next-intl';
import { useState } from 'react';

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
          <CharacterCard key={character.id} character={character} eager={index < EAGER_AVATARS} />
        ))}
      </Grid>
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
