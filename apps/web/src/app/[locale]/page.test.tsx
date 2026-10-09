import { describe, expect, it, vi } from 'vitest';

import { Episodes } from '@/features/episodes';
import messages from '@/messages/pt-BR.json';
import EpisodesPage, { generateMetadata } from './page';

vi.mock('next-intl/server', () => ({
  getTranslations:
    async ({ namespace }: { namespace: keyof typeof messages }) =>
    (key: string) =>
      (messages[namespace] as Record<string, string>)[key],
}));

const props = (searchParams: Record<string, string | string[] | undefined>) => ({
  params: Promise.resolve({ locale: 'pt-BR' }),
  searchParams: Promise.resolve(searchParams),
});

describe('EpisodesPage', () => {
  it('defaults to the first page with no query', async () => {
    const element = await EpisodesPage(props({}));

    expect(element.type).toBe(Episodes);
    expect(element.props).toEqual({ page: 1, query: '' });
  });

  it('takes the first value of repeated params and trims the query', async () => {
    const element = await EpisodesPage(props({ page: ['2', '3'], q: ['  rick ', 'morty'] }));

    expect(element.props).toEqual({ page: 2, query: 'rick' });
  });

  it.each(['0', '-1', '1.5', 'abc'])('renders the not found page for page=%s', async (page) => {
    await expect(EpisodesPage(props({ page }))).rejects.toMatchObject({
      digest: expect.stringContaining('404'),
    });
  });

  it('uses the translated title and per locale alternates', async () => {
    await expect(generateMetadata(props({}))).resolves.toEqual({
      title: 'Episódios',
      alternates: { canonical: '/pt-BR', languages: { 'pt-BR': '/pt-BR', en: '/en' } },
    });
  });
});
