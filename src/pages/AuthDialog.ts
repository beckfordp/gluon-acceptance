import type { Locator, Page } from '@playwright/test';

/** gshop's sign-in / create-account dialog, opened from Checkout's account banner. */
export class AuthDialog {
  readonly dialog: Locator;
  readonly alert: Locator;

  constructor(page: Page) {
    this.dialog = page.getByRole('dialog');
    this.alert = this.dialog.getByRole('alert');
  }

  async signUp(email: string, password: string, confirmPassword = password): Promise<void> {
    await this.dialog.getByLabel('Email').fill(email);
    await this.dialog.getByLabel('Password', { exact: true }).fill(password);
    await this.dialog.getByLabel('Confirm password').fill(confirmPassword);
    await this.dialog.getByRole('button', { name: 'Create account' }).click();
  }

  async signIn(email: string, password: string): Promise<void> {
    await this.dialog.getByLabel('Email').fill(email);
    await this.dialog.getByLabel('Password', { exact: true }).fill(password);
    await this.dialog.getByRole('button', { name: 'Sign in' }).click();
  }
}
