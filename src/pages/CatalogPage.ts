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

  product(name: string): Locator {
    return this.productNames.filter({ hasText: name });
  }
}
