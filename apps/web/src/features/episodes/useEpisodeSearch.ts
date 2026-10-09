import { useEffect, useRef, useTransition } from 'react';

import { useRouter } from '@/i18n/navigation';

const DEBOUNCE_MS = 300;

export function useEpisodeSearch(query: string) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const input = useRef<HTMLInputElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  // Keep the uncontrolled input in sync with the url only when the user is not typing in it.
  useEffect(() => {
    if (input.current && document.activeElement !== input.current) input.current.value = query;
  }, [query]);

  const searchNow = (value: string) => {
    clearTimeout(timer.current);
    const q = value.trim();
    startTransition(() => router.replace(q ? { pathname: '/', query: { q } } : '/'));
  };

  const search = (value: string) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => searchNow(value), DEBOUNCE_MS);
  };

  return { input, search, searchNow, isPending };
}
