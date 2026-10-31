import type { Locator, Page } from '@playwright/test';

/** gshop's Order Confirmation screen, shown once checkout's order is authorized. */
export class ConfirmationPage {
  readonly heading: Locator;
  readonly orderId: Locator;
  readonly status: Locator;
  readonly payment: Locator;
  readonly shippingAddress: Locator;
  readonly total: Locator;

  constructor(page: Page) {
    this.heading = page.getByRole('heading', { level: 1, name: 'Order placed' });
    this.orderId = page.getByText(/^Order ID: /);
    this.status = page.getByText(/^Status: /);
    this.payment = page.getByText('Payment authorised', { exact: true });
    this.shippingAddress = page.getByRole('region', { name: 'Shipping address' });
    this.total = page.getByText(/^Total: /);
  }

  /** The placed order's id, read off the screen. */
  async placedOrderId(): Promise<string> {
    const text = await this.orderId.textContent() ?? '';
    const id = text.replace(/^Order ID: /, '').trim();
    if (id === '') throw new Error(`No order id on the confirmation screen: "${text}"`);
    return id;
  }
}
