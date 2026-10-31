import type { APIRequestContext } from '@playwright/test';
import type { Product } from '../testData';
import { arrayOf, hasFields, readJson } from './shape';

function isProduct(value: unknown): value is Product {
  return hasFields(value, { sku: 'string', name: 'string', priceCents: 'number' });
}

/** Products in the order gshop shows them (`GET /catalogs`). */
export async function catalogProducts(
  request: APIRequestContext,
  catalogUrl: string,
  limit = 100,
): Promise<Product[]> {
  const response = await request.get(`${catalogUrl}/catalogs?limit=${limit}&offset=0`);
  const products = await readJson(response, 'GET /catalogs', arrayOf(isProduct));
  return products.map(({ sku, name, priceCents }) => ({ sku, name, priceCents }));
}

/** Names on catalog-service's first page, in the order gshop shows them. */
export async function firstPageProductNames(
  request: APIRequestContext,
  catalogUrl: string,
  limit = 20,
): Promise<string[]> {
  return (await catalogProducts(request, catalogUrl, limit)).map((p) => p.name);
}
