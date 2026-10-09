import type { ConfigService } from '@nestjs/config';

import type { Env } from '../../src/config/env';
import { ProcessState } from '../../src/health/process-state';

const withDrain = (ms: number) =>
  new ProcessState({ get: () => ms } as unknown as ConfigService<Env, true>);

describe('ProcessState', () => {
  it('turns not ready at once and holds the shutdown for the drain window', async () => {
    const state = withDrain(30);
    const startedAt = Date.now();

    const shutdown = state.beforeApplicationShutdown();

    expect(state.isShuttingDown).toBe(true);
    await shutdown;
    expect(Date.now() - startedAt).toBeGreaterThanOrEqual(25);
  });

  it('does not wait when no drain is configured', async () => {
    const state = withDrain(0);
    const startedAt = Date.now();

    await state.beforeApplicationShutdown();

    expect(Date.now() - startedAt).toBeLessThan(20);
  });
});
