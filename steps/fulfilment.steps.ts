import { expect } from '@playwright/test';
import { findOrder } from '../src/api/orders';
import { Given, Then, When } from '../src/fixtures';
import type { Orders } from '../src/fixtures';
import { OrderHistoryPage } from '../src/pages/OrderHistoryPage';
import { TEST_ADDRESS } from '../src/testData';

/** Card expiry used throughout, as in checkout.steps.ts. */
const EXPIRY = '12/34';

function lastOrderId(orders: Orders): string {
  const [order] = orders.placed.slice(-1);
  if (order === undefined) throw new Error('No order placed in this scenario');
  return order.id;
}

Given('I have bought it with card {string}', async (
  { catalogPage, cartPage, checkoutPage, confirmationPage, orders, stockedProduct },
  number: string,
) => {
  await catalogPage.open();
  await catalogPage.browse();
  await catalogPage.addToCart(stockedProduct.name);
  await expect(catalogPage.addToCartButton(stockedProduct.name)).toHaveText('Added');
  await cartPage.open();
  await cartPage.checkout();
  await checkoutPage.fillAddress(checkoutPage.shipping, TEST_ADDRESS);
  await checkoutPage.fillCard({ number, expiry: EXPIRY });
  await checkoutPage.placeOrder();
  await expect(confirmationPage.status).toHaveText('Status: Authorized');
  await orders.record(await confirmationPage.placedOrderId());
});

When('the operator opens order processing', async ({ fulfilmentPage, orders }) => {
  await fulfilmentPage.open();
  await fulfilmentPage.waitForTask(lastOrderId(orders));
});

When('the operator starts picking it', async ({ fulfilmentPage, orders }) => {
  await fulfilmentPage.startPicking(lastOrderId(orders));
});

When('the operator packs it', async ({ fulfilmentPage, orders }) => {
  await fulfilmentPage.pack(lastOrderId(orders));
});

When('the operator dispatches it', async ({ fulfilmentPage, orders }) => {
  await fulfilmentPage.dispatch(lastOrderId(orders));
});

When('the operator picks, packs and dispatches my order', async ({ fulfilmentPage, orders }) => {
  const orderId = lastOrderId(orders);
  await fulfilmentPage.open();
  await fulfilmentPage.waitForTask(orderId);
  await fulfilmentPage.startPicking(orderId);
  await fulfilmentPage.pack(orderId);
  await fulfilmentPage.dispatch(orderId);
  await expect(fulfilmentPage.state(orderId)).toHaveText('Dispatched');
});

Then('my order shows as {string}', async ({ fulfilmentPage, orders }, state: string) => {
  await expect(fulfilmentPage.state(lastOrderId(orders))).toHaveText(state);
});

Then('it shows the carrier and tracking number', async ({ fulfilmentPage, orders }) => {
  await expect(fulfilmentPage.outcome(lastOrderId(orders))).toHaveText(/^Shipped via DHL — tracking \S+$/);
});

// order-service caches each customer's history for a TTL with no
// invalidation (US-8.1), so opening it before the async outcome lands would
// pin the stale status. Wait for the order itself (uncached), then open it.
Then('my order history eventually shows status {string}', async ({ page, request, config, orders }, status: string) => {
  const orderId = lastOrderId(orders);
  await expect.poll(
    async () => (await findOrder(request, config.serviceUrls.order, orderId))?.status,
    { message: `order ${orderId} to reach "${status}"`, timeout: 30_000 },
  ).toBe(status.toLowerCase().replace(/ /g, '_'));
  const history = new OrderHistoryPage(page);
  await history.open();
  await expect(history.status(orderId)).toHaveText(`Status: ${status}`);
});
