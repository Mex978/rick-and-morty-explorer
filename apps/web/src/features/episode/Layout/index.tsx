'use client';

import type { Character } from '@rma/types';
import Image from 'next/image';
import { useFormatter, useTranslations } from 'next-intl';

import { Link } from '@/i18n/navigation';
import { parseAirDate } from '@/lib/air-date';

import type { EpisodeProps } from '../data';
import {
  BackLink,
  Badge,
  Card,
  CardBody,
  Code,
  Detail,
  Grid,
  Meta,
  Name,
  SectionTitle,
  Title,
} from './styles';

export function EpisodeLayout({ episode }: EpisodeProps) {
  const t = useTranslations('episode');
  const format = useFormatter();

  return (
    <>
      <BackLink as={Link} href="/">
        ← {t('back')}
      </BackLink>
      <Code>{episode.code}</Code>
      <Title>{episode.name}</Title>
      <Meta>
        {t('airDate', { date: format.dateTime(parseAirDate(episode.airDate), { dateStyle: 'long' }) })}
        {' · '}
        {t('characterCount', { count: episode.characterCount })}
      </Meta>
      <SectionTitle>{t('characters')}</SectionTitle>
      <Grid>
        {episode.characters.map((character) => (
          <CharacterCard key={character.id} character={character} />
        ))}
      </Grid>
    </>
  );
}

function CharacterCard({ character }: { character: Character }) {
  const t = useTranslations('character');
  const status = toStatusKey(character.status);

  return (
    <Card>
      <Image src={character.image} alt={character.name} width={300} height={300} />
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

function toStatusKey(status: string): 'alive' | 'dead' | 'unknown' {
  const key = status.toLowerCase();
  return key === 'alive' || key === 'dead' ? key : 'unknown';
}
