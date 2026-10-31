import { describe, expect, it } from 'vitest';
import {
  TEST_ADDRESS,
  TEST_CARDS,
  TEST_PASSWORD,
  pickStockedProduct,
  throwawayEmail,
} from '../../src/testData';

describe('throwawayEmail', () => {
  it('builds a unique, valid address from the time and a random suffix', () => {
    const email = throwawayEmail(1_700_000_000_000, () => 0.5);
    expect(email).toMatch(/^acceptance-1700000000000-[a-z0-9]+@gluon\.test$/);
    expect(email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  });

  it('differs between calls in the same millisecond', () => {
    const now = 1_700_000_000_000;
    expect(throwawayEmail(now, () => 0.1)).not.toBe(throwawayEmail(now, () => 0.2));
  });

  it('defaults to the current time and Math.random', () => {
    expect(throwawayEmail()).not.toBe(throwawayEmail());
  });
});

describe('test data constants', () => {
  it('has the payment-service test cards', () => {
    expect(TEST_CARDS.approve.number).toBe('4242 4242 4242 4242');
    expect(TEST_CARDS.declineAtAuthorize.number).toBe('4000 0000 0000 0002');
    expect(TEST_CARDS.declineAtCapture.number).toBe('5555 5555 5555 4444');
    for (const card of Object.values(TEST_CARDS)) expect(card.expiry).toMatch(/^\d{2}\/\d{2}$/);
  });

  it('has a valid GB address and a password the user service accepts', () => {
    expect(TEST_ADDRESS.country).toBe('GB');
    expect(TEST_ADDRESS.line1).not.toBe('');
    expect(TEST_PASSWORD.length).toBeGreaterThanOrEqual(8);
  });
});

describe('pickStockedProduct', () => {
  const catalog = [
    { sku: 'a', name: 'A', priceCents: 100 },
    { sku: 'b', name: 'B', priceCents: 200 },
    { sku: 'c', name: 'C', priceCents: 300 },
    { sku: 'd', name: 'D', priceCents: 400 },
  ];
  const inventory = [
    { sku: 'a', quantityAvailable: 0 },
    { sku: 'b', quantityAvailable: 5 },
    { sku: 'c', quantityAvailable: 1 },
    { sku: 'd', quantityAvailable: 9 },
  ];

  it('picks the first catalog product with enough stock', () => {
    expect(pickStockedProduct(catalog, inventory)).toEqual(catalog[1]);
  });

  it('honours the quantity needed', () => {
    expect(pickStockedProduct(catalog, inventory, { needed: 6 })).toEqual(catalog[3]);
  });

  it('skips candidates by offset so parallel workers get different products', () => {
    expect(pickStockedProduct(catalog, inventory, { offset: 1 })).toEqual(catalog[2]);
    expect(pickStockedProduct(catalog, inventory, { offset: 2 })).toEqual(catalog[3]);
  });

  it('wraps the offset round the candidates', () => {
    expect(pickStockedProduct(catalog, inventory, { offset: 3 })).toEqual(catalog[1]);
  });

  it('skips excluded SKUs, so a second product differs from the first', () => {
    expect(pickStockedProduct(catalog, inventory, { exclude: ['b'] })).toEqual(catalog[2]);
    expect(pickStockedProduct(catalog, inventory, { exclude: ['b'], offset: 1 })).toEqual(catalog[3]);
  });

  it('ignores catalog products with no inventory row', () => {
    expect(pickStockedProduct([{ sku: 'z', name: 'Z', priceCents: 1 }, catalog[1]], inventory))
      .toEqual(catalog[1]);
  });

  it('returns undefined when nothing has enough stock', () => {
    expect(pickStockedProduct(catalog, inventory, { needed: 10 })).toBeUndefined();
  });
});
