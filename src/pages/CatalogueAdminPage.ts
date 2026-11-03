import { expect, type Locator, type Page } from '@playwright/test';

/**
 * gshop's Catalogue section (Admin → Show catalogue). A prototype (US-28.1):
 * product edits are simulated in the browser, but the stock ±1 controls
 * write to inventory-service, so only those are accepted here.
 */
export class CatalogueAdminPage {
  readonly section: Locator;

  constructor(private readonly page: Page) {
    this.section = page.getByRole('region', { name: 'Catalogue' });
  }

  async open(): Promise<void> {
    await this.page.goto('/');
    await this.page.getByRole('link', { name: 'Admin' }).click();
    await this.section.getByRole('button', { name: 'Show catalogue' }).click();
    await expect(this.section.getByRole('table', { name: 'Catalogue' })).toBeVisible();
  }

  async search(term: string): Promise<void> {
    await this.section.getByRole('searchbox', { name: 'Search products' }).fill(term);
  }

  row(sku: string): Locator {
    return this.section.getByRole('table', { name: 'Catalogue' }).getByRole('row')
      .filter({ has: this.page.getByRole('cell', { name: sku, exact: true }) });
  }

  /** The row's Available cell (after thumbnail, sku, name, price). */
  available(sku: string): Locator {
    return this.row(sku).getByRole('cell').nth(4);
  }

  /** Clicks +1 or -1, then waits for the button to re-enable (the write has landed). */
  async adjust(sku: string, direction: 'Increase' | 'Decrease'): Promise<void> {
    const button = this.row(sku).getByRole('button', { name: `${direction} stock for ${sku}` });
    await button.click();
    await expect(button).toBeEnabled();
  }
}
