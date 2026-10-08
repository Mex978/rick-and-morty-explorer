'use client';

import type { ComponentProps, FormEvent, Ref } from 'react';

import { Form, Input } from './styles';

interface SearchFieldProps extends Omit<ComponentProps<'input'>, 'type' | 'ref' | 'onSubmit'> {
  label: string;
  ref?: Ref<HTMLInputElement>;
  onSubmit?: (event: FormEvent<HTMLFormElement>) => void;
}

export function SearchField({ label, onSubmit, ...input }: SearchFieldProps) {
  return (
    <Form role="search" onSubmit={onSubmit ?? ((event) => event.preventDefault())}>
      <Input type="search" aria-label={label} autoComplete="off" {...input} />
    </Form>
  );
}
