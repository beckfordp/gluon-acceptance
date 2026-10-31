import { expect } from '@playwright/test';
import { Given, Then, When } from '../src/fixtures';
import { formatPrice } from '../src/format';

When('I add it to my cart', async ({ catalogPage, stockedProduct }) => {
  await catalogPage.addToCart(stockedProduct.name);
});

Given('I have added it to my cart', async ({ catalogPage, stockedProduct }) => {
  await catalogPage.shopFor(stockedProduct.name);
});

Then('the product shows it was added', async ({ catalogPage, stockedProduct }) => {
  await expect(catalogPage.addToCartButton(stockedProduct.name)).toHaveText('Added');
});

When('I view my cart', async ({ cartPage }) => {
  await cartPage.open();
});

When('I increase its quantity', async ({ cartPage, stockedProduct }) => {
  await cartPage.increase(stockedProduct.name);
});

When('I remove it from my cart', async ({ cartPage, stockedProduct }) => {
  await cartPage.remove(stockedProduct.name);
});

Then('my cart has it with quantity {int}', async ({ cartPage, stockedProduct }, quantity: number) => {
  const { name, priceCents } = stockedProduct;
  await expect(cartPage.details(name)).toHaveText(`${name} — qty ${quantity} — ${formatPrice(priceCents * quantity)}`);
  await expect(cartPage.total).toHaveText(`Total: ${formatPrice(priceCents * quantity)}`);
});

Then('my cart is empty', async ({ cartPage }) => {
  await expect(cartPage.empty).toBeVisible();
});
