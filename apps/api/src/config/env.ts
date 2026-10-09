import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3001),
  RICK_AND_MORTY_API_URL: z.url().default('https://rickandmortyapi.com/api'),
  CACHE_TTL_SECONDS: z.coerce.number().int().positive().default(3600),
  // How long readiness reports down before the server stops, so a balancer can drain traffic.
  SHUTDOWN_DRAIN_MS: z.coerce.number().int().nonnegative().default(0),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>): Env {
  const result = envSchema.safeParse(config);
  if (!result.success) {
    throw new Error(`Invalid environment variables:\n${z.prettifyError(result.error)}`);
  }
  return result.data;
}
