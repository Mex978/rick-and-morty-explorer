import { useEffect, useRef, useState } from 'react';

// The upstream CDN rate-limits bursts with a retry-after of about ten seconds.
const RETRY_DELAYS_MS = [4000, 8000];

export function useAvatar(url: string) {
  const [attempt, setAttempt] = useState(0);
  const [failed, setFailed] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const retry = () => {
    const delay = RETRY_DELAYS_MS[attempt];
    if (delay === undefined) return setFailed(true);
    timer.current = setTimeout(() => setAttempt(attempt + 1), delay);
  };

  return { src: attempt ? `${url}?retry=${attempt}` : url, failed, retry };
}
