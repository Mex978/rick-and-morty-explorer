import { describe, expect, it } from 'vitest';

import en from '@/messages/en.json';
import ptBR from '@/messages/pt-BR.json';

function entriesOf(messages: object, prefix = ''): [string, string][] {
  return Object.entries(messages).flatMap(([key, value]) =>
    typeof value === 'object' ? entriesOf(value, `${prefix}${key}.`) : [[`${prefix}${key}`, value as string]],
  );
}

const argumentsOf = (message: string) => [...message.matchAll(/\{(\w+)/g)].map((match) => match[1]).sort();

describe('messages', () => {
  it('has the same keys in every locale', () => {
    expect(entriesOf(en).map(([key]) => key).sort()).toEqual(entriesOf(ptBR).map(([key]) => key).sort());
  });

  it('uses the same icu arguments in every locale', () => {
    const english = new Map(entriesOf(en));

    for (const [key, message] of entriesOf(ptBR)) {
      expect({ key, args: argumentsOf(message) }).toEqual({ key, args: argumentsOf(english.get(key) ?? '') });
    }
  });
});
