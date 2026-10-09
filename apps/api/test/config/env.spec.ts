import { validateEnv } from '../../src/config/env';

describe('validateEnv', () => {
  it('applies defaults and coerces numbers', () => {
    expect(validateEnv({ PORT: '4000' })).toEqual({
      PORT: 4000,
      RICK_AND_MORTY_API_URL: 'https://rickandmortyapi.com/api',
      CACHE_TTL_SECONDS: 86400,
      UPSTREAM_CONCURRENCY: 3,
      THROTTLE_LIMIT: 300,
      TRUST_PROXY_HOPS: 0,
      SHUTDOWN_DRAIN_MS: 0,
      METRICS_TOKEN: undefined,
    });
  });

  it('treats a blank metrics token as unset', () => {
    expect(validateEnv({ METRICS_TOKEN: '  ' }).METRICS_TOKEN).toBeUndefined();
    expect(validateEnv({ METRICS_TOKEN: 'secret' }).METRICS_TOKEN).toBe('secret');
  });

  it('fails fast on an invalid value, naming the variable', () => {
    expect(() => validateEnv({ CACHE_TTL_SECONDS: '0' })).toThrow(/CACHE_TTL_SECONDS/);
    expect(() => validateEnv({ RICK_AND_MORTY_API_URL: 'not a url' })).toThrow(
      /RICK_AND_MORTY_API_URL/,
    );
    expect(() => validateEnv({ THROTTLE_LIMIT: '0' })).toThrow(/THROTTLE_LIMIT/);
    expect(() => validateEnv({ UPSTREAM_CONCURRENCY: '0' })).toThrow(/UPSTREAM_CONCURRENCY/);
    expect(() => validateEnv({ TRUST_PROXY_HOPS: '-1' })).toThrow(/TRUST_PROXY_HOPS/);
  });
});
