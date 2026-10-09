import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { afterEach, vi } from 'vitest';

vi.mock('next/navigation', async (importOriginal) => ({
  ...(await importOriginal<typeof import('next/navigation')>()),
  useRouter: vi.fn(() => ({ replace: vi.fn(), push: vi.fn() })),
  usePathname: vi.fn(() => '/pt-BR'),
  useSearchParams: vi.fn(() => new URLSearchParams()),
}));

afterEach(() => {
  cleanup();
  for (const hook of [useRouter, usePathname, useSearchParams]) vi.mocked(hook).mockReset();
});
