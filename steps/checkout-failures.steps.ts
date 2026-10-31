import { expect } from '@playwright/test';
import { setStock } from '../src/api/inventory';
import { ordersFor } from '../src/api/orders';
import { Given, Then, When } from '../src/fixtures';
import { TEST_ADDRESS, TEST_CARDS } from '../src/testData';

Given('I am at checkout with 2 of it and 1 of another product', async (
  { catalogPage, cartPage, checkoutPage, stockedProduct, otherStockedProduct },
) => {
  await catalogPage.open();
  await catalogPage.browse();
  for (const { name } of [stockedProduct, otherStockedProduct]) {
    await catalogPage.addToCart(name);
    await expect(catalogPage.addToCartButton(name)).toHaveText('Added');
  }
  await cartPage.open();
  await cartPage.increase(stockedProduct.name);
  await expect(cartPage.details(stockedProduct.name)).toContainText('qty 2');
  await cartPage.checkout();
  await expect(checkoutPage.heading).toBeVisible();
});

When('only {int} of it is left in stock', async ({ request, config, stockedProduct }, available: number) => {
  await setStock(request, config.serviceUrls.inventory, { ...stockedProduct.stock, quantityAvailable: available });
});

When('I place my order with {string} set to {string}', async ({ checkoutPage }, label: string, value: string) => {
  await checkoutPage.fillAddress(checkoutPage.shipping, TEST_ADDRESS);
  await checkoutPage.fillCard(TEST_CARDS.approve);
  const field = ['Card number', 'Expiry date'].includes(label)
    ? checkoutPage.payment.getByLabel(label, { exact: true })
    : checkoutPage.field(checkoutPage.shipping, label);
  await field.fill(value);
  await checkoutPage.placeOrder();
});

When('I remove it from my cart and place my order again', async ({ checkoutPage, stockedProduct }) => {
  await checkoutPage.alert.getByRole('button', { name: `Remove ${stockedProduct.name} from cart` }).click();
  await checkoutPage.placeOrder();
});

Then('my payment is declined', async ({ checkoutPage }) => {
  await expect(checkoutPage.alert).toHaveText(/^Payment declined: .+\. Try another card and submit again\.$/);
});

Then('it can\'t be reserved for insufficient stock', async ({ checkoutPage, stockedProduct }) => {
  await expect(checkoutPage.alert).toContainText(`${stockedProduct.name}: insufficient stock`);
});

Then('no order was created', async ({ request, config, shopper }) => {
  expect(await ordersFor(request, config.serviceUrls.order, shopper.customerId)).toHaveLength(0);
});

Then('my order is placed for the other product only', async ({ confirmationPage, orders, otherStockedProduct }) => {
  await expect(confirmationPage.heading).toBeVisible();
  await orders.record(await confirmationPage.placedOrderId());
  await expect(confirmationPage.items).toHaveCount(1);
  await expect(confirmationPage.items).toContainText(`${otherStockedProduct.name} — qty 1`);
});
