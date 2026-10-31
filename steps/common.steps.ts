import { expect } from '@playwright/test';
import { stockFor } from '../src/api/inventory';
import { Given } from '../src/fixtures';

Given('I am a registered customer', async ({ registeredCustomer }) => {
  expect(registeredCustomer.userId).not.toBe('');
});

Given('a product is in stock', async ({ stockedProduct, request, config }) => {
  const row = await stockFor(request, config.serviceUrls.inventory, stockedProduct.sku);
  expect(row.quantityAvailable).toBeGreaterThan(0);
});

Given('I have placed an order for it', async ({ orders, $testInfo }) => {
  const order = await orders.place();
  // Lets scripts check the order is gone after teardown.
  $testInfo.annotations.push({ type: 'order', description: order.id });
  expect(order.status).toBe('authorized');
});
