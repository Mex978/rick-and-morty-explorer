import { Semaphore } from '../../src/rick-and-morty/semaphore';

const tick = () => new Promise((resolve) => setImmediate(resolve));

describe('Semaphore', () => {
  it('runs up to the limit at once and starts the rest as slots free up, in order', async () => {
    const slots = new Semaphore(2);
    const started: number[] = [];
    const release: Array<() => void> = [];
    const task = (id: number) =>
      slots.run(
        () =>
          new Promise<number>((resolve) => {
            started.push(id);
            release.push(() => resolve(id));
          }),
      );

    const results = Promise.all([task(1), task(2), task(3), task(4)]);
    await tick();
    expect(started).toEqual([1, 2]);
    expect(slots.isFull).toBe(true);

    release[0]();
    await tick();
    expect(started).toEqual([1, 2, 3]);

    release[1]();
    release[2]();
    await tick();
    expect(started).toEqual([1, 2, 3, 4]);

    release[3]();
    expect(await results).toEqual([1, 2, 3, 4]);
    expect(slots.isFull).toBe(false);
  });

  it('frees the slot when a task fails', async () => {
    const slots = new Semaphore(1);

    await expect(slots.run(() => Promise.reject(new Error('boom')))).rejects.toThrow('boom');

    expect(slots.isFull).toBe(false);
    await expect(slots.run(() => Promise.resolve('next'))).resolves.toBe('next');
  });
});
