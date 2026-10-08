import { describe, expect, it } from 'vitest';

import en from '@/messages/en.json';
import ptBR from '@/messages/pt-BR.json';

function keysOf(messages: object, prefix = ''): string[] {
  return Object.entries(messages).flatMap(([key, value]) =>
    typeof value === 'object' ? keysOf(value, `${prefix}${key}.`) : `${prefix}${key}`,
  );
}

describe('messages', () => {
  it('has the same keys in every locale', () => {
    expect(keysOf(en).sort()).toEqual(keysOf(ptBR).sort());
  });
});
