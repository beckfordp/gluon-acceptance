import { expect } from '@playwright/test';
import { stockFor } from '../src/api/inventory';
import { Then, When } from '../src/fixtures';

When('the operator finds the product in the catalogue', async ({ catalogueAdmin, stockedProduct }) => {
  await catalogueAdmin.open();
  await catalogueAdmin.search(stockedProduct.sku);
});

Then('the catalogue shows its stock', async ({ catalogueAdmin, stockedProduct }) => {
  await expect(catalogueAdmin.available(stockedProduct.sku)).toHaveText(String(stockedProduct.stock.quantityAvailable));
});

When('the operator adds one to its stock', async ({ catalogueAdmin, stockedProduct }) => {
  await catalogueAdmin.adjust(stockedProduct.sku, 'Increase');
});

When('the operator removes one from its stock', async ({ catalogueAdmin, stockedProduct }) => {
  await catalogueAdmin.adjust(stockedProduct.sku, 'Decrease');
});

Then(
  'the catalogue and inventory both show {int} more available',
  async ({ catalogueAdmin, request, config, stockedProduct }, more: number) => {
    const { sku, stock } = stockedProduct;
    const expected = stock.quantityAvailable + more;
    await expect(catalogueAdmin.available(sku)).toHaveText(String(expected));
    expect((await stockFor(request, config.serviceUrls.inventory, sku)).quantityAvailable).toBe(expected);
  },
);
