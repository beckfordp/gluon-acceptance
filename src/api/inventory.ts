import type { APIRequestContext } from '@playwright/test';
import { arrayOf, expectStatus, hasFields, readJson } from './shape';

export interface StockRow {
  id: string
  sku: string
  quantityAvailable: number
  quantityReserved: number
}

function isStockRow(value: unknown): value is StockRow {
  return hasFields(value, { id: 'string', sku: 'string', quantityAvailable: 'number', quantityReserved: 'number' });
}

function pick({ id, sku, quantityAvailable, quantityReserved }: StockRow): StockRow {
  return { id, sku, quantityAvailable, quantityReserved };
}

/** Every inventory row (`GET /inventorys`, unpaged). */
export async function allStock(request: APIRequestContext, inventoryUrl: string): Promise<StockRow[]> {
  const rows = await readJson(await request.get(`${inventoryUrl}/inventorys`), 'GET /inventorys', arrayOf(isStockRow));
  return rows.map(pick);
}

export async function stockFor(request: APIRequestContext, inventoryUrl: string, sku: string): Promise<StockRow> {
  const what = `GET /inventorys?sku=${sku}`;
  const response = await request.get(`${inventoryUrl}/inventorys?sku=${encodeURIComponent(sku)}`);
  const rows = await readJson(response, what, arrayOf(isStockRow));
  const [row] = rows;
  if (rows.length !== 1 || row === undefined) throw new Error(`${what}: expected one row, got ${rows.length}`);
  return pick(row);
}

/** `PUT /inventorys/{id}`: sets `quantityAvailable`; reserved stock is owned by the reservation ledger. */
export async function setStock(
  request: APIRequestContext,
  inventoryUrl: string,
  row: StockRow,
): Promise<void> {
  const response = await request.put(`${inventoryUrl}/inventorys/${row.id}`, {
    data: { quantityAvailable: row.quantityAvailable },
  });
  await expectStatus(response, `PUT /inventorys/${row.id}`, 200, 204);
}
