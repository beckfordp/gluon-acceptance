import { expect } from '@playwright/test';
import { findOrder } from '../src/api/orders';
import { Given, Then, When } from '../src/fixtures';
import { FulfilmentPage } from '../src/pages/FulfilmentPage';
import { OrderHistoryPage } from '../src/pages/OrderHistoryPage';

When('I cancel my order from my order history', async ({ page, orders }) => {
  const history = new OrderHistoryPage(page);
  await history.open();
  await history.cancel(orders.latest().id);
});

When('I try to cancel it', async ({ page, orders }) => {
  await new OrderHistoryPage(page).cancel(orders.latest().id);
});

// The operator works in another window, so the shopper's history stays as it
// was loaded: still `authorized`, still offering Cancel. Waits for capture to
// confirm the order, so the cancel meets the final status.
Given('meanwhile the operator picks, packs and dispatches my order', async ({ context, request, config, orders }) => {
  const orderId = orders.latest().id;
  const operator = new FulfilmentPage(await context.newPage());
  await operator.open();
  await operator.waitForTask(orderId);
  await operator.startPicking(orderId);
  await operator.pack(orderId);
  await operator.dispatch(orderId);
  await expect.poll(
    async () => (await findOrder(request, config.serviceUrls.order, orderId))?.status,
    { message: `order ${orderId} to be confirmed`, timeout: 30_000 },
  ).toBe('confirmed');
});

Then('the operator sees my order as {string}', async ({ fulfilmentPage, orders }, state: string) => {
  await fulfilmentPage.open();
  await fulfilmentPage.waitForState(orders.latest().id, state);
});

Then('I\'m told it\'s past cancelling and pointed at returns', async ({ page, orders }) => {
  await expect(new OrderHistoryPage(page).alert(orders.latest().id))
    .toContainText('If it has already shipped, see returns (US-23).');
});

Then('my order is still {string}', async ({ request, config, orders }, status: string) => {
  const order = await findOrder(request, config.serviceUrls.order, orders.latest().id);
  expect(order?.status).toBe(status.toLowerCase().replace(/ /g, '_'));
});
