/** A card as typed into gshop's checkout form. */
export interface TestCard {
  number: string
  expiry: string
}

/**
 * payment-service's test cards (its `application.conf`): one approves, one is
 * declined at authorize (insufficient funds), one authorizes but is declined
 * at capture (so the order ends `payment_failed` after dispatch).
 */
/** Expiry for every test card; validation scenarios type their own. */
export const TEST_CARD_EXPIRY = '12/34';

export const TEST_CARDS = {
  approve: { number: '4242 4242 4242 4242', expiry: TEST_CARD_EXPIRY },
  declineAtAuthorize: { number: '4000 0000 0000 0002', expiry: TEST_CARD_EXPIRY },
  declineAtCapture: { number: '5555 5555 5555 4444', expiry: TEST_CARD_EXPIRY },
} as const satisfies Record<string, TestCard>;

export const TEST_ADDRESS = {
  line1: '1 Acceptance Way',
  city: 'London',
  postcode: 'EC1A 1BB',
  country: 'GB',
} as const;

/** A billing address that differs from `TEST_ADDRESS` in every field. */
export const TEST_BILLING_ADDRESS = {
  line1: '2 Billing Street',
  city: 'Manchester',
  postcode: 'M1 1AE',
  country: 'IE',
} as const;

/** Meets user-service's rule (8+ characters). */
export const TEST_PASSWORD = 'acceptance-pass-1';

/** A unique address user-service accepts, so every signup is a new user. */
export function throwawayEmail(now: number = Date.now(), random: () => number = Math.random): string {
  const suffix = Math.floor(random() * 36 ** 6).toString(36);
  return `acceptance-${now}-${suffix}@gluon.test`;
}

export interface Product {
  sku: string
  name: string
  priceCents: number
}

export interface StockLevel {
  sku: string
  quantityAvailable: number
}

/**
 * The catalog product, in catalog order, with at least `needed` available.
 * `offset` skips that many candidates (wrapping), so parallel workers, which
 * pass their index, mutate different inventory rows; `exclude`d SKUs are
 * never picked.
 */
export function pickStockedProduct<P extends Product>(
  catalog: readonly P[],
  inventory: readonly StockLevel[],
  { needed = 1, offset = 0, exclude = [] }: { needed?: number; offset?: number; exclude?: readonly string[] } = {},
): P | undefined {
  const available = new Map(inventory.map((row) => [row.sku, row.quantityAvailable]));
  const candidates = catalog.filter((p) => !exclude.includes(p.sku) && (available.get(p.sku) ?? 0) >= needed);
  return candidates.length === 0 ? undefined : candidates[offset % candidates.length];
}
