import { expect, type Page } from '@playwright/test';
import { isRecord } from '../src/api/shape';
import { Given, Then, When } from '../src/fixtures';
import type { TestData } from '../src/support/testData';
import { TEST_PASSWORD, throwawayEmail } from '../src/testData';

/** gshop's signed-in session (its `src/services/mockAuth.ts`). */
const SESSION_KEY = 'gshop:authSession';

/** Tracks a user signed up through the UI so teardown cleans up their orders. */
async function trackSignedInUser(page: Page, testData: TestData): Promise<void> {
  const raw = await page.evaluate((key) => window.localStorage.getItem(key), SESSION_KEY);
  const session: unknown = raw === null ? null : JSON.parse(raw);
  if (!isRecord(session) || !isRecord(session.user) || typeof session.user.userId !== 'string') {
    throw new Error(`No signed-in session in ${SESSION_KEY}`);
  }
  testData.trackCustomer(session.user.userId);
}

Given('I am at checkout', async ({ catalogPage, cartPage, checkoutPage, stockedProduct }) => {
  await catalogPage.open();
  await catalogPage.browse();
  await catalogPage.addToCart(stockedProduct.name);
  await expect(catalogPage.addToCartButton(stockedProduct.name)).toHaveText('Added');
  await cartPage.open();
  await cartPage.checkout();
  await expect(checkoutPage.heading).toBeVisible();
});

When('I go to checkout', async ({ cartPage, checkoutPage }) => {
  await cartPage.open();
  await cartPage.checkout();
  await expect(checkoutPage.heading).toBeVisible();
});

When('I create an account with a new email', async ({ checkoutPage, authDialog, scenario, page, testData }) => {
  scenario.email = throwawayEmail();
  await checkoutPage.openAuth('Create account');
  await authDialog.signUp(scenario.email, TEST_PASSWORD);
  await expect(authDialog.dialog).toBeHidden();
  await trackSignedInUser(page, testData);
});

When('I create an account with my email', async ({ checkoutPage, authDialog, registeredCustomer }) => {
  await checkoutPage.openAuth('Create account');
  await authDialog.signUp(registeredCustomer.email, registeredCustomer.password);
});

When('I create an account with passwords that don\'t match', async ({ checkoutPage, authDialog }) => {
  await checkoutPage.openAuth('Create account');
  await authDialog.signUp(throwawayEmail(), TEST_PASSWORD, `${TEST_PASSWORD}-other`);
});

When('I sign in', async ({ checkoutPage, authDialog, registeredCustomer, scenario }) => {
  scenario.email = registeredCustomer.email;
  await checkoutPage.openAuth('Sign in');
  await authDialog.signIn(registeredCustomer.email, registeredCustomer.password);
  await expect(authDialog.dialog).toBeHidden();
});

When('I sign in with a wrong password', async ({ checkoutPage, authDialog, registeredCustomer }) => {
  await checkoutPage.openAuth('Sign in');
  await authDialog.signIn(registeredCustomer.email, `${registeredCustomer.password}-wrong`);
});

When('I sign out', async ({ checkoutPage }) => {
  await checkoutPage.signOut();
});

Then('I am signed in', async ({ checkoutPage, scenario }) => {
  if (scenario.email === undefined) throw new Error('No email signed up or in with in this scenario');
  await expect(checkoutPage.account).toContainText(`Signed in as ${scenario.email}`);
});

Then('I am signed out', async ({ checkoutPage }) => {
  await expect(checkoutPage.account.getByRole('button', { name: 'Sign in' })).toBeVisible();
  await expect(checkoutPage.account).not.toContainText('Signed in as');
});

Then('the sign-in fails with {string}', async ({ authDialog }, message: string) => {
  await expect(authDialog.alert).toHaveText(message);
});

Then('I see {string}', async ({ page }, message: string) => {
  await expect(page.getByText(message, { exact: true })).toBeVisible();
});
