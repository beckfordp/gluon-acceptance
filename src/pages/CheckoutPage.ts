import type { Locator, Page } from '@playwright/test';

export interface AddressValues {
  line1: string
  city: string
  postcode: string
  country: string
}

/** gshop's Checkout screen: account banner, shipping/billing/payment fieldsets, Place order. */
export class CheckoutPage {
  readonly heading: Locator;
  readonly account: Locator;
  readonly shipping: Locator;
  readonly billing: Locator;
  readonly payment: Locator;
  readonly sameAsShipping: Locator;
  readonly cardNumber: Locator;
  readonly expiry: Locator;
  /** Checkout's failure alert (decline, stock); the auth dialog's alert is separate. */
  readonly alert: Locator;

  constructor(private readonly page: Page) {
    this.heading = page.getByRole('heading', { level: 1, name: 'Checkout' });
    this.account = page.getByRole('region', { name: 'Account' });
    this.shipping = page.getByRole('group', { name: 'Shipping address' });
    this.billing = page.getByRole('group', { name: 'Billing address' });
    this.payment = page.getByRole('group', { name: 'Payment' });
    this.sameAsShipping = page.getByRole('checkbox', { name: 'Billing address same as shipping' });
    this.cardNumber = this.payment.getByLabel('Card number');
    this.expiry = this.payment.getByLabel('Expiry date');
    this.alert = page.locator('form').getByRole('alert');
  }

  /** An address field in a fieldset, by its label ("Address line 1", "City", ...). */
  field(group: Locator, label: string): Locator {
    return group.getByLabel(label, { exact: true });
  }

  async fillAddress(group: Locator, address: AddressValues): Promise<void> {
    await this.field(group, 'Address line 1').fill(address.line1);
    await this.field(group, 'City').fill(address.city);
    await this.field(group, 'Postcode').fill(address.postcode);
    await this.field(group, 'Country').fill(address.country);
  }

  async fillCard(card: { number: string; expiry: string }): Promise<void> {
    await this.cardNumber.fill(card.number);
    await this.expiry.fill(card.expiry);
  }

  async placeOrder(): Promise<void> {
    await this.page.getByRole('button', { name: 'Place order' }).click();
  }

  async openAuth(mode: 'Sign in' | 'Create account'): Promise<void> {
    await this.account.getByRole('button', { name: mode }).click();
  }

  async signOut(): Promise<void> {
    await this.account.getByRole('button', { name: 'Sign out' }).click();
  }
}
