import type { APIRequestContext } from '@playwright/test';
import { arrayOf, hasFields, readJson } from './shape';

export interface FulfilmentTask {
  orderId: string
  state: string
}

/** States a task never leaves. */
export const TERMINAL_TASK_STATES: readonly string[] = ['DISPATCHED', 'DISPATCH_FAILED'];

function isTask(value: unknown): value is FulfilmentTask {
  return hasFields(value, { orderId: 'string', state: 'string' });
}

/** The order's task, or `undefined` while it hasn't been created yet (there's no get-by-id). */
export async function taskFor(
  request: APIRequestContext,
  fulfilmentUrl: string,
  orderId: string,
): Promise<FulfilmentTask | undefined> {
  const tasks = await readJson(
    await request.get(`${fulfilmentUrl}/fulfilment-tasks`),
    'GET /fulfilment-tasks',
    arrayOf(isTask),
  );
  const task = tasks.find((t) => t.orderId === orderId);
  return task === undefined ? undefined : { orderId: task.orderId, state: task.state };
}

/** `POST /fulfilment-tasks/{orderId}/fail`: releases stock and voids the payment. */
export async function failTask(
  request: APIRequestContext,
  fulfilmentUrl: string,
  orderId: string,
  reason: string,
): Promise<void> {
  const what = `POST /fulfilment-tasks/${orderId}/fail`;
  await readJson(await request.post(`${fulfilmentUrl}/fulfilment-tasks/${orderId}/fail`, { data: { reason } }), what, isTask);
}
