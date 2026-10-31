import type { Locator, Page } from '@playwright/test';

/** gshop's Catalog screen: the landing view, a grid of product cards. */
export class CatalogPage {
  readonly productNames: Locator;

  constructor(private readonly page: Page) {
    this.productNames = page.getByRole('listitem').getByRole('heading', { level: 3 });
  }

  async open(): Promise<void> {
    await this.page.goto('/');
  }

  /** Shows the catalog (navigating back to it if needed) and waits for the first page to load. */
  async browse(): Promise<void> {
    const back = this.page.getByRole('button', { name: 'Back to Catalog' });
    if (await back.isVisible()) await back.click();
    await this.page.getByText('Loading...', { exact: true }).waitFor({ state: 'hidden' });
  }

  /** The product's card: name, SKU, price and its add-to-cart button. */
  card(name: string): Locator {
    return this.page.getByRole('listitem')
      .filter({ has: this.page.getByRole('heading', { level: 3, name, exact: true }) });
  }

  /** The card's add-to-cart button, whichever label it shows ("Add to cart", "Adding...", "Added"). */
  addToCartButton(name: string): Locator {
    return this.card(name).getByRole('button', { name: /^(Add to cart|Adding\.\.\.|Added)$/ });
  }

  async addToCart(name: string): Promise<void> {
    await this.card(name).getByRole('button', { name: 'Add to cart' }).click();
  }

  async loadMore(): Promise<void> {
    await this.page.getByRole('button', { name: 'Load more' }).click();
  }
}
