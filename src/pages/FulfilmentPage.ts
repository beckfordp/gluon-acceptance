import { expect, type Locator, type Page } from '@playwright/test';

/**
 * gshop's Fulfilment section (Admin → Show fulfilment): one card per
 * fulfilment task, across every customer. Scenarios only ever touch their
 * own order's card, found by its order ID.
 */
export class FulfilmentPage {
  readonly section: Locator;
  readonly alert: Locator;

  constructor(private readonly page: Page) {
    this.section = page.getByRole('region', { name: 'Fulfilment' });
    this.alert = this.section.getByRole('alert');
  }

  async open(): Promise<void> {
    await this.page.goto('/');
    await this.page.getByRole('link', { name: 'Admin' }).click();
    await this.section.getByRole('button', { name: 'Show fulfilment' }).click();
    await expect(this.section.getByRole('tablist', { name: 'Orders by state' })).toBeVisible();
  }

  task(orderId: string): Locator {
    return this.section.getByRole('listitem').filter({ hasText: orderId });
  }

  /** The task's state badge: "Pending", "Picking", ..., "Dispatch failed", "Cancelled". */
  state(orderId: string): Locator {
    return this.task(orderId).getByText(/^(Pending|Picking|Packed|Dispatched|Dispatch failed|Cancelled)$/);
  }

  /** "Shipped via {carrier} — tracking {no}" or "Not dispatched: {reason}". */
  outcome(orderId: string): Locator {
    return this.task(orderId).getByText(/^(Shipped via|Not dispatched:) /);
  }

  /**
   * Waits for the order's task to show up. It's created async from
   * `PaymentAuthorized`, and the section only fetches on open and Refresh.
   * Waits for the last Refresh to settle too: a fetch still in flight would
   * overwrite the next action's result with the stale state.
   */
  async waitForTask(orderId: string): Promise<void> {
    await this.refreshUntil(() => expect(this.task(orderId)).toBeVisible({ timeout: 1_000 }));
  }

  /** Waits for the task to reach `state` after a change made elsewhere (e.g. a cancel), refreshing until it does. */
  async waitForState(orderId: string, state: string): Promise<void> {
    await this.refreshUntil(() => expect(this.state(orderId)).toHaveText(state, { timeout: 1_000 }));
  }

  async startPicking(orderId: string): Promise<void> {
    await this.click(orderId, 'Start picking');
  }

  async pack(orderId: string): Promise<void> {
    await this.click(orderId, 'Mark packed');
  }

  /** Dispatches with the form's defaults: DHL and a generated tracking number. */
  async dispatch(orderId: string): Promise<void> {
    await this.click(orderId, 'Dispatch');
    await this.click(orderId, 'Confirm dispatch');
  }

  /** Opens Report problem, types `reason` (may be empty) and confirms. */
  async reportProblem(orderId: string, reason: string): Promise<void> {
    await this.click(orderId, 'Report problem');
    await this.task(orderId).getByLabel('What went wrong?').fill(reason);
    await this.click(orderId, 'Confirm failure');
  }

  private async refreshUntil(check: () => Promise<void>): Promise<void> {
    const refresh = this.section.getByRole('button', { name: 'Refresh' });
    await expect(async () => {
      await refresh.click();
      await expect(refresh).toBeEnabled({ timeout: 1_000 });
      await check();
    }).toPass({ timeout: 30_000 });
  }

  /** Each action's button only appears once the task reaches its state, and clicks wait for it. */
  private async click(orderId: string, button: string): Promise<void> {
    await this.task(orderId).getByRole('button', { name: button, exact: true }).click();
  }
}
