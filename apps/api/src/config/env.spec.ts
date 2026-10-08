import { validateEnv } from './env';

describe('validateEnv', () => {
  it('applies defaults and coerces numbers', () => {
    expect(validateEnv({ PORT: '4000' })).toEqual({
      PORT: 4000,
      RICK_AND_MORTY_API_URL: 'https://rickandmortyapi.com/api',
      CACHE_TTL_SECONDS: 3600,
    });
  });

  it('fails fast on an invalid value, naming the variable', () => {
    expect(() => validateEnv({ CACHE_TTL_SECONDS: '0' })).toThrow(/CACHE_TTL_SECONDS/);
    expect(() => validateEnv({ RICK_AND_MORTY_API_URL: 'not a url' })).toThrow(/RICK_AND_MORTY_API_URL/);
  });
});
