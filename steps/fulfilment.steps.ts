import { expect } from '@playwright/test';
import { stockFor } from '../src/api/inventory';
import { findOrder } from '../src/api/orders';
import { Given, Then, When } from '../src/fixtures';
import { OrderHistoryPage } from '../src/pages/OrderHistoryPage';
import { TEST_ADDRESS, TEST_CARD_EXPIRY } from '../src/testData';

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
  await checkoutPage.fillCard({ number, expiry: TEST_CARD_EXPIRY });
  await checkoutPage.placeOrder();
  await expect(confirmationPage.status).toHaveText('Status: Authorized');
  await orders.record(await confirmationPage.placedOrderId());
});

When('the operator opens order processing', async ({ fulfilmentPage, orders }) => {
  await fulfilmentPage.open();
  await fulfilmentPage.waitForTask(orders.latest().id);
});

When('the operator starts picking it', async ({ fulfilmentPage, orders }) => {
  await fulfilmentPage.startPicking(orders.latest().id);
});

When('the operator packs it', async ({ fulfilmentPage, orders }) => {
  await fulfilmentPage.pack(orders.latest().id);
});

When('the operator dispatches it', async ({ fulfilmentPage, orders }) => {
  await fulfilmentPage.dispatch(orders.latest().id);
});

When('the operator picks, packs and dispatches my order', async ({ fulfilmentPage, orders }) => {
  const orderId = orders.latest().id;
  await fulfilmentPage.open();
  await fulfilmentPage.waitForTask(orderId);
  await fulfilmentPage.startPicking(orderId);
  await fulfilmentPage.pack(orderId);
  await fulfilmentPage.dispatch(orderId);
  await expect(fulfilmentPage.state(orderId)).toHaveText('Dispatched');
});

Given('the operator has moved my order to {string}', async ({ fulfilmentPage, orders }, state: string) => {
  const orderId = orders.latest().id;
  const pick = () => fulfilmentPage.startPicking(orderId);
  const pack = () => fulfilmentPage.pack(orderId);
  const moves: Record<string, (() => Promise<void>)[]> = { Pending: [], Picking: [pick], Packed: [pick, pack] };
  const path = moves[state];
  if (path === undefined) throw new Error(`Can't move an order to "${state}"`);
  for (const move of path) await move();
  await expect(fulfilmentPage.state(orderId)).toHaveText(state);
});

When('the operator reports a problem: {string}', async ({ fulfilmentPage, orders }, reason: string) => {
  await fulfilmentPage.reportProblem(orders.latest().id, reason);
});

Then('my order shows as {string}', async ({ fulfilmentPage, orders }, state: string) => {
  await expect(fulfilmentPage.state(orders.latest().id)).toHaveText(state);
});

Then('it shows the carrier and tracking number', async ({ fulfilmentPage, orders }) => {
  await expect(fulfilmentPage.outcome(orders.latest().id)).toHaveText(/^Shipped via DHL — tracking \S+$/);
});

Then('it shows it wasn\'t dispatched because {string}', async ({ fulfilmentPage, orders }, reason: string) => {
  await expect(fulfilmentPage.outcome(orders.latest().id)).toHaveText(`Not dispatched: ${reason}`);
});

Then('the operator is told {string}', async ({ fulfilmentPage }, message: string) => {
  await expect(fulfilmentPage.alert).toHaveText(message);
});

// order-service releases the reservation on DispatchFailed, putting the row back as it was.
Then('its stock is released', async ({ request, config, stockedProduct }) => {
  const { sku, stock } = stockedProduct;
  await expect.poll(async () => {
    const { quantityAvailable, quantityReserved } = await stockFor(request, config.serviceUrls.inventory, sku);
    return { quantityAvailable, quantityReserved };
  }).toEqual({ quantityAvailable: stock.quantityAvailable, quantityReserved: stock.quantityReserved });
});

// order-service caches each customer's history for a TTL with no
// invalidation (US-8.1), so opening it before the async outcome lands would
// pin the stale status. Wait for the order itself (uncached), then open it.
Then('my order history eventually shows status {string}', async ({ page, request, config, orders }, status: string) => {
  const orderId = orders.latest().id;
  await expect.poll(
    async () => (await findOrder(request, config.serviceUrls.order, orderId))?.status,
    { message: `order ${orderId} to reach "${status}"`, timeout: 30_000 },
  ).toBe(status.toLowerCase().replace(/ /g, '_'));
  const history = new OrderHistoryPage(page);
  await history.open();
  await expect(history.status(orderId)).toHaveText(`Status: ${status}`);
});
