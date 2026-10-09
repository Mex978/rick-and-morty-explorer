import { describe, expect, it, vi } from 'vitest';

import EpisodesPage, { generateMetadata } from '@/app/[locale]/page';
import { Episodes } from '@/features/episodes';
import messages from '@/messages/pt-BR.json';

vi.mock('next-intl/server', () => ({
  getTranslations:
    async ({ namespace }: { namespace: keyof typeof messages }) =>
    (key: string) =>
      (messages[namespace] as Record<string, string>)[key],
}));

const props = (searchParams: Record<string, string | string[]>) => ({
  params: Promise.resolve({ locale: 'pt-BR' }),
  searchParams: Promise.resolve(searchParams),
});

describe('EpisodesPage', () => {
  it('defaults to the first page with no query', async () => {
    const page = await EpisodesPage(props({}));

    expect(page.type).toBe(Episodes);
    expect(page.props).toEqual({ page: 1, query: '' });
  });

  it('takes the first value of repeated params and trims the query', async () => {
    const page = await EpisodesPage(props({ page: ['2', '3'], q: ['  rick ', 'morty'] }));

    expect(page.props).toEqual({ page: 2, query: 'rick' });
  });

  it('cuts the query at the length the api accepts', async () => {
    const page = await EpisodesPage(props({ q: 'x'.repeat(150) }));

    expect(page.props).toEqual({ page: 1, query: 'x'.repeat(100) });
  });

  it.each(['0', '-1', '1.5', 'abc'])('renders the not found page for page=%s', async (page) => {
    await expect(EpisodesPage(props({ page }))).rejects.toMatchObject({
      digest: expect.stringContaining('404'),
    });
  });

  it('describes the first page as the canonical one', async () => {
    await expect(generateMetadata(props({}))).resolves.toEqual({
      title: 'Episódios',
      alternates: { canonical: '/pt-BR', languages: { 'pt-BR': '/pt-BR', en: '/en' } },
      robots: undefined,
    });
  });

  it('points other pages to themselves and keeps searches out of the index', async () => {
    const paged = await generateMetadata(props({ page: '2' }));
    const searched = await generateMetadata(props({ q: 'rick' }));

    expect(paged.alternates?.canonical).toBe('/pt-BR?page=2');
    expect(searched.robots).toEqual({ index: false });
  });
});
