import { expect, type Locator, type Page } from '@playwright/test';

/** gshop's Order History screen: one card per order for the current identity. */
export class OrderHistoryPage {
  readonly empty: Locator;

  constructor(private readonly page: Page) {
    this.empty = page.getByText('You have no past orders.');
  }

  /** Loads the shop afresh and opens history, which fetches on entry (it doesn't poll). */
  async open(): Promise<void> {
    await this.page.goto('/');
    await this.page.getByRole('button', { name: 'Order History' }).click();
  }

  order(orderId: string): Locator {
    return this.page.getByRole('listitem').filter({ hasText: `Order ID: ${orderId}` });
  }

  status(orderId: string): Locator {
    return this.order(orderId).getByText(/^Status: /);
  }

  /** The order's cancel error, e.g. the `409` once it's past cancelling. */
  alert(orderId: string): Locator {
    return this.order(orderId).getByRole('alert');
  }

  /**
   * Cancel order, then confirm, and waits for the outcome: `Cancelled`, or the
   * error alert. Navigating away sooner aborts the in-flight `PATCH`. The
   * button only shows while the order is `authorized`.
   */
  async cancel(orderId: string): Promise<void> {
    await this.page.getByRole('button', { name: `Cancel order ${orderId}` }).click();
    await this.page.getByRole('button', { name: `Confirm cancel ${orderId}` }).click();
    await expect(this.status(orderId).filter({ hasText: 'Cancelled' }).or(this.alert(orderId))).toBeVisible();
  }
}
