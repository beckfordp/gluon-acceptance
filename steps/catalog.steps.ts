import { expect } from '@playwright/test';
import { catalogProducts } from '../src/api/catalog';
import { Given, Then, When } from '../src/fixtures';
import { formatPrice } from '../src/format';

const PAGE_SIZE = 20;

Given('I open the shop', async ({ catalogPage }) => {
  await catalogPage.open();
});

When('I browse the catalog', async ({ catalogPage }) => {
  await catalogPage.browse();
});

When('I load more products', async ({ catalogPage }) => {
  await catalogPage.loadMore();
});

Then('I see products from the catalog', async ({ catalogPage, config, request }) => {
  const products = await catalogProducts(request, config.serviceUrls.catalog, PAGE_SIZE);
  expect(products, 'catalog-service has no products: seed it first').not.toHaveLength(0);
  await expect(catalogPage.productNames).toHaveText(products.map((p) => p.name));
});

Then('each product shows its name, SKU and price', async ({ catalogPage, config, request }) => {
  const products = await catalogProducts(request, config.serviceUrls.catalog, PAGE_SIZE);
  for (const product of products) {
    const card = catalogPage.card(product.name);
    await expect(card.getByText(product.sku, { exact: true })).toBeVisible();
    await expect(card.getByText(formatPrice(product.priceCents), { exact: true })).toBeVisible();
  }
});

Then('I see the first two pages of the catalog in order', async ({ catalogPage, config, request }) => {
  const products = await catalogProducts(request, config.serviceUrls.catalog, 2 * PAGE_SIZE);
  expect(products.length, 'catalog needs more than one page: run seed-watches.sh').toBeGreaterThan(PAGE_SIZE);
  await expect(catalogPage.productNames).toHaveText(products.map((p) => p.name));
});
