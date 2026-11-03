import { expect } from '@playwright/test';
import { findOrder } from '../src/api/orders';
import { Given, Then, When } from '../src/fixtures';
import type { AdminConsolePage } from '../src/pages/AdminConsolePage';
import { OrderHistoryPage } from '../src/pages/OrderHistoryPage';

/** How the console labels the scenario's customer: their account email, or the guest email given at checkout. */
function customerLabel(signedInAs: string | undefined, guestEmail: string | undefined): string {
  if (signedInAs !== undefined) return signedInAs;
  if (guestEmail !== undefined) return `Guest ${guestEmail}`;
  throw new Error('No customer email in this scenario: sign in or check out as a guest first');
}

/** Refreshes the open record's emails until each subject shows as sent. */
async function expectSent(adminConsole: AdminConsolePage, subjects: string[]): Promise<void> {
  await adminConsole.refreshEmailsUntil(async () => {
    for (const subject of subjects) {
      await expect(adminConsole.emailStatus(subject)).toHaveText('sent', { timeout: 1_000 });
    }
  });
}

// Waits for fulfilment to have the order first: a cancel that beats the
// task's creation leaves it Pending (gluon TD-23).
Given('my order is cancelled by {string}', async ({ page, request, config, adminConsole, fulfilmentPage, orders }, who: string) => {
  const orderId = orders.latest().id;
  await fulfilmentPage.open();
  await fulfilmentPage.waitForTask(orderId);
  if (who === 'me') {
    const history = new OrderHistoryPage(page);
    await history.open();
    await history.cancel(orderId);
  } else {
    await adminConsole.open();
    await adminConsole.openOrder(orderId);
    if (who === 'the operator') await adminConsole.operatorCancel(orderId);
    else if (who === 'expiry') await adminConsole.expireAuthorization(orderId);
    else throw new Error(`Unknown canceller "${who}"`);
  }
  // Expiry cancels asynchronously; the email follows the cancellation.
  await expect.poll(
    async () => (await findOrder(request, config.serviceUrls.order, orderId))?.status,
    { message: `order ${orderId} to be cancelled`, timeout: 30_000 },
  ).toBe('cancelled');
});

When('the operator opens my customer record', async ({ adminConsole, checkoutPage, scenario }) => {
  await adminConsole.open();
  await adminConsole.openCustomer(customerLabel(scenario.email, checkoutPage.guestEmailUsed));
});

Then('it shows my order as {string}', async ({ adminConsole, checkoutPage, scenario, orders }, status: string) => {
  const label = customerLabel(scenario.email, checkoutPage.guestEmailUsed);
  await expect(adminConsole.customerOrderRow(label, orders.latest().id)).toContainText(status);
});

Then('it lists the email {string}', async ({ adminConsole }, subject: string) => {
  await expectSent(adminConsole, [subject]);
});

Then('it lists the emails {string} and {string}', async ({ adminConsole }, a: string, b: string) => {
  await expectSent(adminConsole, [a, b]);
});

Then('it lists the emails {string}, {string} and {string}', async ({ adminConsole }, a: string, b: string, c: string) => {
  await expectSent(adminConsole, [a, b, c]);
});

Then('the email {string} says {string}', async ({ adminConsole }, subject: string, copy: string) => {
  await expectSent(adminConsole, [subject]);
  const email = adminConsole.email(subject);
  await email.getByRole('button', { name: 'Show email' }).click();
  await expect(email).toContainText(copy);
});
