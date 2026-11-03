import type { APIRequestContext } from '@playwright/test';
import { describe, expect, it } from 'vitest';
import { setStock, type StockRow } from '../../src/api/inventory';

const row: StockRow = { id: 'inv-1', sku: 'watch-1', quantityAvailable: 7, quantityReserved: 2 };

describe('setStock', () => {
  it('PUTs quantityAvailable only — reserved stock belongs to the ledger', async () => {
    const calls: { url: string; data: unknown }[] = [];
    const request = {
      put: async (url: string, options: { data: unknown }) => {
        calls.push({ url, data: options.data });
        return { status: () => 200, text: async () => '' };
      },
    } as unknown as APIRequestContext;

    await setStock(request, 'http://inventory', row);

    expect(calls).toEqual([{ url: 'http://inventory/inventorys/inv-1', data: { quantityAvailable: 7 } }]);
  });
});
