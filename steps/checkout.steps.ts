import { expect } from '@playwright/test';
import { stockFor } from '../src/api/inventory';
import { Then, When } from '../src/fixtures';
import { formatPrice } from '../src/format';
import { OrderHistoryPage } from '../src/pages/OrderHistoryPage';
import { TEST_ADDRESS, TEST_BILLING_ADDRESS, TEST_CARD_EXPIRY } from '../src/testData';

When('I enter my shipping address', async ({ checkoutPage }) => {
  await checkoutPage.fillAddress(checkoutPage.shipping, TEST_ADDRESS);
});

When('I enter a different billing address', async ({ checkoutPage }) => {
  await checkoutPage.sameAsShipping.uncheck();
  await checkoutPage.fillAddress(checkoutPage.billing, TEST_BILLING_ADDRESS);
});

When('I pay with card {string}', async ({ checkoutPage }, number: string) => {
  await checkoutPage.fillCard({ number, expiry: TEST_CARD_EXPIRY });
});

When('I place my order paying with card {string}', async ({ checkoutPage }, number: string) => {
  await checkoutPage.fillAddress(checkoutPage.shipping, TEST_ADDRESS);
  await checkoutPage.fillCard({ number, expiry: TEST_CARD_EXPIRY });
  await checkoutPage.placeOrder();
});

When('I place my order', async ({ checkoutPage }) => {
  await checkoutPage.placeOrder();
});

Then('my order is placed', async ({ confirmationPage, orders }) => {
  await expect(confirmationPage.heading).toBeVisible();
  await orders.record(await confirmationPage.placedOrderId());
});

Then('my payment is authorized', async ({ confirmationPage }) => {
  await expect(confirmationPage.status).toHaveText('Status: Authorized');
  await expect(confirmationPage.payment).toBeVisible();
});

Then('the confirmation shows my shipping address and total', async ({ confirmationPage, stockedProduct }) => {
  const { line1, city, postcode, country } = TEST_ADDRESS;
  await expect(confirmationPage.shippingAddress).toContainText(line1);
  await expect(confirmationPage.shippingAddress).toContainText(`${city}, ${postcode}`);
  await expect(confirmationPage.shippingAddress).toContainText(country);
  // "I am at checkout" puts one of the product in the cart.
  await expect(confirmationPage.total).toHaveText(`Total: ${formatPrice(stockedProduct.priceCents)}`);
});

Then('its stock is reserved', async ({ request, config, stockedProduct }) => {
  const { sku, stock } = stockedProduct;
  await expect.poll(async () => {
    const { quantityAvailable, quantityReserved } = await stockFor(request, config.serviceUrls.inventory, sku);
    return { quantityAvailable, quantityReserved };
  }).toEqual({ quantityAvailable: stock.quantityAvailable - 1, quantityReserved: stock.quantityReserved + 1 });
});

Then('my order is saved to my account', async ({ page, orders, registeredCustomer }) => {
  const order = orders.latest();
  expect(order.customerId).toBe(registeredCustomer.userId);
  await new OrderHistoryPage(page).open();
  await expect(page.getByText(`Signed in as ${registeredCustomer.email} — showing your orders`)).toBeVisible();
  await expect(new OrderHistoryPage(page).order(order.id)).toBeVisible();
});
