export interface PollOptions {
  /** Named in the timeout error. */
  what: string
  timeoutMs?: number
  intervalMs?: number
  now?: () => number
  sleep?: (ms: number) => Promise<void>
}

function realSleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Calls `read` until `done` accepts its value, then returns that value; throws
 * once `timeoutMs` passes. The suite's only way to wait for async effects.
 */
export async function pollUntil<T>(
  read: () => Promise<T>,
  done: (value: T) => boolean,
  { what, timeoutMs = 30_000, intervalMs = 500, now = Date.now, sleep = realSleep }: PollOptions,
): Promise<T> {
  const deadline = now() + timeoutMs;
  for (;;) {
    const value = await read();
    if (done(value)) return value;
    if (now() >= deadline) {
      throw new Error(`Timed out after ${timeoutMs}ms waiting for ${what}; last value: ${JSON.stringify(value)}`);
    }
    await sleep(intervalMs);
  }
}
