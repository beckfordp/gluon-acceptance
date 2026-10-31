import { expect } from '@playwright/test';
import { Then, When } from '../src/fixtures';
import { OrderHistoryPage } from '../src/pages/OrderHistoryPage';

When('I open my order history', async ({ page }) => {
  await new OrderHistoryPage(page).open();
});

Then('I see my order with status {string}', async ({ page, orders }, status: string) => {
  const history = new OrderHistoryPage(page);
  const [order] = orders.placed.slice(-1);
  if (order === undefined) throw new Error('No order placed in this scenario');
  await expect(history.status(order.id)).toHaveText(`Status: ${status}`);
});
