import type { Locator, Page } from '@playwright/test';

/** gshop's Cart screen: one line per product, `+1`/Remove per line, the total and Checkout. */
export class CartPage {
  readonly empty: Locator;
  readonly total: Locator;

  constructor(private readonly page: Page) {
    this.empty = page.getByText('Your cart is empty.');
    this.total = page.getByText(/^Total: /);
  }

  /** Opens the cart from the header; it loads the cart afresh each time. */
  async open(): Promise<void> {
    await this.page.getByRole('button', { name: 'View Cart' }).click();
  }

  line(name: string): Locator {
    return this.page.getByRole('listitem').filter({ hasText: `${name} — qty ` });
  }

  /** The line's text, e.g. "Rolex Submariner — qty 2 — $18000.00". */
  details(name: string): Locator {
    return this.line(name).getByText(`${name} — qty `);
  }

  async increase(name: string): Promise<void> {
    await this.line(name).getByRole('button', { name: '+1' }).click();
  }

  async remove(name: string): Promise<void> {
    await this.line(name).getByRole('button', { name: 'Remove' }).click();
  }

  async checkout(): Promise<void> {
    await this.page.getByRole('button', { name: 'Checkout' }).click();
  }
}
