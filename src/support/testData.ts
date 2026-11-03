import type { APIRequestContext } from '@playwright/test';
import type { Config } from '../config';
import { pollUntil } from '../poll';
import { failTask, taskFor, TERMINAL_TASK_STATES } from '../api/fulfilment';
import { deleteOrder, findOrder, ordersFor, TERMINAL_ORDER_STATUSES } from '../api/orders';

export const CLEANUP_REASON = 'acceptance cleanup';

/**
 * What a scenario created, so teardown can tidy up: every order of every
 * tracked customer is driven to a terminal status and deleted. Stock is not
 * restored — each run starts from a reset + seed (TD-24), and rewriting rows
 * here overwrote reservations other orders still held.
 */
export class TestData {
  private readonly customers = new Set<string>();

  constructor(
    private readonly request: APIRequestContext,
    private readonly config: Config,
  ) {}

  trackCustomer(customerId: string): void {
    this.customers.add(customerId);
  }

  /** Cleans up everything it can, then throws one error listing anything it couldn't. */
  async cleanUp(): Promise<void> {
    const failures: string[] = [];
    const attempt = async (what: string, step: () => Promise<void>): Promise<void> => {
      try {
        await step();
      } catch (error) {
        failures.push(`${what}: ${error instanceof Error ? error.message : String(error)}`);
      }
    };

    for (const customerId of this.customers) {
      await attempt(`orders of ${customerId}`, async () => {
        const orders = await ordersFor(this.request, this.config.serviceUrls.order, customerId);
        for (const order of orders) await attempt(`order ${order.id}`, () => this.removeOrder(order.id));
      });
    }

    if (failures.length > 0) throw new Error(`Test data cleanup failed:\n  ${failures.join('\n  ')}`);
  }

  /** Fails any open fulfilment task (releasing stock, voiding payment), waits for a terminal status, deletes. */
  private async removeOrder(orderId: string): Promise<void> {
    const { order: orderUrl, fulfilment: fulfilmentUrl } = this.config.serviceUrls;
    await pollUntil(
      async () => {
        const order = await findOrder(this.request, orderUrl, orderId);
        if (order === undefined || TERMINAL_ORDER_STATUSES.includes(order.status)) return order?.status ?? 'deleted';
        const task = await taskFor(this.request, fulfilmentUrl, orderId);
        if (task !== undefined && !TERMINAL_TASK_STATES.includes(task.state)) {
          // A concurrent transition can reject this; the next poll sees the new state.
          await failTask(this.request, fulfilmentUrl, orderId, CLEANUP_REASON).catch(() => undefined);
        }
        return order.status;
      },
      (status) => status === 'deleted' || TERMINAL_ORDER_STATUSES.includes(status),
      { what: `order ${orderId} to reach a terminal status`, timeoutMs: 60_000 },
    );
    await deleteOrder(this.request, orderUrl, orderId);
    await pollUntil(
      () => findOrder(this.request, orderUrl, orderId),
      (order) => order === undefined,
      { what: `order ${orderId} to be gone` },
    );
  }

}
