import { expect, type Locator, type Page } from '@playwright/test';

/**
 * gshop's Operations section (Admin → Show operations): every order, its
 * reservation ledger, fulfilment task and emails, with operator Cancel and
 * Expire. It reads each service live; writes fan out over Kafka, so checks
 * refresh until the services catch up.
 */
export class AdminConsolePage {
  readonly section: Locator;
  /** The last action's outcome: a status on success, an alert on failure. */
  readonly result: Locator;

  constructor(private readonly page: Page) {
    this.section = page.getByRole('region', { name: 'Operations' });
    this.result = this.section.locator('.admin-console__result');
  }

  async open(): Promise<void> {
    await this.page.goto('/');
    await this.page.getByRole('link', { name: 'Admin' }).click();
    await this.section.getByRole('button', { name: 'Show operations' }).click();
    await expect(this.section.getByRole('tablist', { name: 'Admin views' })).toBeVisible();
  }

  /** The Orders tab's row for the order. */
  orderRow(orderId: string): Locator {
    return this.section.getByRole('table', { name: 'Orders', exact: true }).getByRole('row').filter({ hasText: orderId });
  }

  /** Opens the Orders tab and the order's detail. */
  async openOrder(orderId: string): Promise<void> {
    await this.section.getByRole('tab', { name: 'Orders' }).click();
    await this.orderRow(orderId).getByRole('button', { name: orderId }).click();
    await expect(this.section.getByRole('heading', { name: `Order ${orderId}` })).toBeVisible();
  }

  /** A fact in the open order's detail: "Order status", "Fulfilment", ... */
  fact(name: string): Locator {
    return this.section.locator('.admin-console__facts dt').filter({ hasText: name }).locator('+ dd');
  }

  /** The open order's ledger line status per sku. */
  ledgerStatus(orderId: string, sku: string): Locator {
    return this.section.getByRole('table', { name: `Reservations for ${orderId}` })
      .getByRole('row').filter({ hasText: sku }).getByRole('cell').nth(4);
  }

  /** Why the open order offers no actions, e.g. "Past cancelling — ...". */
  refusal(): Locator {
    return this.section.locator('.admin-console__detail > p.admin-console__note');
  }

  actions(orderId: string): Locator {
    return this.section.getByRole('button', { name: new RegExp(`^(Operator cancel|Expire authorization for) ${orderId}$`) });
  }

  async operatorCancel(orderId: string): Promise<void> {
    await this.section.getByRole('button', { name: `Operator cancel ${orderId}` }).click();
    await this.section.getByRole('button', { name: `Confirm operator cancel for ${orderId}` }).click();
  }

  async expireAuthorization(orderId: string): Promise<void> {
    await this.section.getByRole('button', { name: `Expire authorization for ${orderId}` }).click();
    await this.section.getByRole('button', { name: `Confirm authorization expiry for ${orderId}` }).click();
  }

  /** Opens the Customers tab and the customer's record, by its label (account email or "Guest {email}"). */
  async openCustomer(label: string): Promise<void> {
    await this.section.getByRole('tab', { name: 'Customers' }).click();
    // The label resolves from user-service after the list renders, so wait for it.
    await this.section.getByRole('table', { name: 'Customers' }).getByRole('button', { name: label, exact: true }).click();
    await expect(this.section.getByRole('heading', { name: label, exact: true })).toBeVisible();
  }

  /** The open customer record's row for the order. */
  customerOrderRow(label: string, orderId: string): Locator {
    return this.section.getByRole('table', { name: `Orders for ${label}` }).getByRole('row').filter({ hasText: orderId });
  }

  /** An email in the open record's history, by subject. */
  email(subject: string): Locator {
    return this.section.getByRole('listitem').filter({ has: this.page.getByText(subject, { exact: true }) });
  }

  /** The email's status badge: "pending", "sent", "failed" or "unresolved". */
  emailStatus(subject: string): Locator {
    return this.email(subject).locator('.admin-console__badge');
  }

  /** Clicks Refresh emails until `check` passes: emails are sent as each event lands. */
  async refreshEmailsUntil(check: () => Promise<void>): Promise<void> {
    const refresh = this.section.getByRole('button', { name: 'Refresh emails' });
    await expect(async () => {
      await refresh.click();
      await check();
    }).toPass({ timeout: 30_000 });
  }

  /** Clicks Refresh order until `check` passes: each service reports its side when it gets there. */
  async refreshOrderUntil(check: () => Promise<void>): Promise<void> {
    const refresh = this.section.getByRole('button', { name: 'Refresh order' });
    await expect(async () => {
      await refresh.click();
      await check();
    }).toPass({ timeout: 30_000 });
  }
}
