import { describe, expect, it } from 'vitest';
import { pollUntil } from '../../src/poll';

function fakeClock(): { now: () => number; sleep: (ms: number) => Promise<void>; slept: number[] } {
  let t = 0;
  const slept: number[] = [];
  return {
    now: () => t,
    sleep: async (ms) => {
      slept.push(ms);
      t += ms;
    },
    slept,
  };
}

describe('pollUntil', () => {
  it('returns the first value that satisfies the condition', async () => {
    const clock = fakeClock();
    let calls = 0;
    const value = await pollUntil(async () => ++calls, (n) => n >= 3, { what: 'count', ...clock });
    expect(value).toBe(3);
    expect(clock.slept).toEqual([500, 500]);
  });

  it('does not sleep when the first value is already done', async () => {
    const clock = fakeClock();
    expect(await pollUntil(async () => 'x', () => true, { what: 'x', ...clock })).toBe('x');
    expect(clock.slept).toEqual([]);
  });

  it('times out naming what it waited for and the last value seen', async () => {
    const clock = fakeClock();
    await expect(
      pollUntil(async () => ({ status: 'authorized' }), () => false, { what: 'order terminal', timeoutMs: 2000, ...clock }),
    ).rejects.toThrow('Timed out after 2000ms waiting for order terminal; last value: {"status":"authorized"}');
  });

  it('defaults to the real clock', async () => {
    let calls = 0;
    expect(await pollUntil(async () => ++calls, (n) => n === 2, { what: 'two', intervalMs: 1 })).toBe(2);
  });
});
