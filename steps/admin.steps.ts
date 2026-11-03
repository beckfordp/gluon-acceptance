import { expect } from '@playwright/test';
import { Then, When } from '../src/fixtures';

When('the operator opens the console', async ({ adminConsole }) => {
  await adminConsole.open();
});

When('the operator opens my order in the console', async ({ adminConsole, orders }) => {
  await adminConsole.open();
  await adminConsole.openOrder(orders.latest().id);
});

When('the operator cancels it from the console', async ({ adminConsole, orders }) => {
  await adminConsole.operatorCancel(orders.latest().id);
  await expect(adminConsole.result).toContainText(`Order ${orders.latest().id} cancelled by operator.`);
});

When('the operator expires its payment authorization', async ({ adminConsole, orders }) => {
  await adminConsole.expireAuthorization(orders.latest().id);
  await expect(adminConsole.result).toContainText(`Authorization for ${orders.latest().id} expired`);
});

Then('the console lists my order as {string} for my guest email', async ({ adminConsole, checkoutPage, orders }, status: string) => {
  await adminConsole.section.getByRole('tab', { name: 'Orders' }).click();
  const row = adminConsole.orderRow(orders.latest().id);
  await expect(row).toContainText(`Guest ${checkoutPage.guestEmailUsed}`);
  await expect(row).toContainText(status);
});

Then(
  'the console shows my order {string} with fulfilment {string} and its stock {string}',
  async ({ adminConsole, orders, stockedProduct }, status: string, fulfilment: string, ledger: string) => {
    const orderId = orders.latest().id;
    await adminConsole.refreshOrderUntil(async () => {
      await expect(adminConsole.fact('Order status')).toHaveText(status, { timeout: 1_000 });
      await expect(adminConsole.fact('Fulfilment')).toHaveText(fulfilment, { timeout: 1_000 });
      await expect(adminConsole.ledgerStatus(orderId, stockedProduct.sku)).toHaveText(ledger, { timeout: 1_000 });
    });
  },
);

Then('the console offers no cancel or expiry, saying {string}', async ({ adminConsole, orders }, reason: string) => {
  await expect(adminConsole.refusal()).toHaveText(reason);
  await expect(adminConsole.actions(orders.latest().id)).toHaveCount(0);
});
