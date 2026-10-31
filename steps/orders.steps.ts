import { expect } from '@playwright/test';
import { Then, When } from '../src/fixtures';
import { OrderHistoryPage } from '../src/pages/OrderHistoryPage';

When('I open my order history', async ({ page }) => {
  await new OrderHistoryPage(page).open();
});

Then('I see my order with status {string}', async ({ page, orders }, status: string) => {
  const history = new OrderHistoryPage(page);
  await expect(history.status(orders.latest().id)).toHaveText(`Status: ${status}`);
});
