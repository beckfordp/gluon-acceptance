import type { Locator, Page } from '@playwright/test';

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
}
