import type { APIRequestContext } from '@playwright/test';
import type { Config } from '../config';
import { pollUntil } from '../poll';
import { failTask, taskFor, TERMINAL_TASK_STATES } from '../api/fulfilment';
import { type StockRow, setStock, stockFor } from '../api/inventory';
import { deleteOrder, findOrder, ordersFor, TERMINAL_ORDER_STATUSES } from '../api/orders';

export const CLEANUP_REASON = 'acceptance cleanup';

/** Read this many times, `intervalMs` apart, to trust a restored row has settled. */
const STABLE_READS = 4;

/** Only `quantityAvailable` is restorable; reserved stock follows the ledger and may differ while other orders hold it. */
export function sameStock(a: StockRow, b: StockRow): boolean {
  return a.quantityAvailable === b.quantityAvailable;
}

/**
 * What a scenario created or changed, so teardown can put the cluster back:
 * every order of every tracked customer is driven to a terminal status and
 * deleted, then every snapshotted inventory row's `quantityAvailable` is restored.
 */
export class TestData {
  private readonly customers = new Set<string>();
  private readonly snapshots = new Map<string, StockRow>();

  constructor(
    private readonly request: APIRequestContext,
    private readonly config: Config,
  ) {}

  trackCustomer(customerId: string): void {
    this.customers.add(customerId);
  }

  /** Records the row as it is now; later snapshots of the same row are ignored. */
  async snapshotStock(sku: string): Promise<StockRow> {
    const row = await stockFor(this.request, this.config.serviceUrls.inventory, sku);
    if (!this.snapshots.has(row.id)) this.snapshots.set(row.id, row);
    return row;
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
    for (const row of this.snapshots.values()) await attempt(`stock ${row.sku}`, () => this.restore(row));

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

  /**
   * Puts the row back, then re-reads it to catch a late reservation release
   * landing after the write, rewriting until it holds steady.
   */
  private async restore(snapshot: StockRow): Promise<void> {
    const inventoryUrl = this.config.serviceUrls.inventory;
    let stableReads = 0;
    await pollUntil(
      async () => {
        const current = await stockFor(this.request, inventoryUrl, snapshot.sku);
        if (sameStock(current, snapshot)) {
          stableReads += 1;
        } else {
          stableReads = 0;
          await setStock(this.request, inventoryUrl, snapshot);
        }
        return { ...current, stableReads };
      },
      (row) => row.stableReads >= STABLE_READS,
      { what: `stock ${snapshot.sku} to hold at its snapshot`, timeoutMs: 30_000 },
    );
  }
}
