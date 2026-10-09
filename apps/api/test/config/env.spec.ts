import { validateEnv } from '../../src/config/env';

describe('validateEnv', () => {
  it('applies defaults and coerces numbers', () => {
    expect(validateEnv({ PORT: '4000' })).toEqual({
      PORT: 4000,
      RICK_AND_MORTY_API_URL: 'https://rickandmortyapi.com/api',
      CACHE_TTL_SECONDS: 3600,
      THROTTLE_LIMIT: 300,
      TRUST_PROXY_HOPS: 0,
      SHUTDOWN_DRAIN_MS: 0,
    });
  });

  it('fails fast on an invalid value, naming the variable', () => {
    expect(() => validateEnv({ CACHE_TTL_SECONDS: '0' })).toThrow(/CACHE_TTL_SECONDS/);
    expect(() => validateEnv({ RICK_AND_MORTY_API_URL: 'not a url' })).toThrow(
      /RICK_AND_MORTY_API_URL/,
    );
    expect(() => validateEnv({ THROTTLE_LIMIT: '0' })).toThrow(/THROTTLE_LIMIT/);
    expect(() => validateEnv({ TRUST_PROXY_HOPS: '-1' })).toThrow(/TRUST_PROXY_HOPS/);
  });
});
