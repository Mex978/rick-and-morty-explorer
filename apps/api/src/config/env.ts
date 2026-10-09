import { z } from 'zod';

const optionalString = z
  .string()
  .trim()
  .optional()
  .transform((value) => value || undefined);

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3001),
  RICK_AND_MORTY_API_URL: z.url().default('https://rickandmortyapi.com/api'),
  // The upstream content never changes, so responses are kept for a day.
  CACHE_TTL_SECONDS: z.coerce.number().int().positive().default(86400),
  // Calls to the upstream in flight at once; the rest wait, instead of tripping its rate limit.
  UPSTREAM_CONCURRENCY: z.coerce.number().int().positive().default(3),
  // Requests per minute per client ip. Sized for a server-side consumer such as the Next.js app.
  THROTTLE_LIMIT: z.coerce.number().int().positive().default(300),
  // Proxies in front of the api whose X-Forwarded-For is trusted; 0 when clients connect directly.
  TRUST_PROXY_HOPS: z.coerce.number().int().nonnegative().default(0),
  // How long readiness reports down before the server stops, so a balancer can drain traffic.
  SHUTDOWN_DRAIN_MS: z.coerce.number().int().nonnegative().default(0),
  // When set, /metrics requires it as a bearer token.
  METRICS_TOKEN: optionalString,
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>): Env {
  const result = envSchema.safeParse(config);
  if (!result.success) {
    throw new Error(`Invalid environment variables:\n${z.prettifyError(result.error)}`);
  }
  return result.data;
}
