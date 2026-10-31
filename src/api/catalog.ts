import type { APIRequestContext } from '@playwright/test';

interface CatalogItem {
  name: string;
}

function isCatalogItem(value: unknown): value is CatalogItem {
  return typeof value === 'object' && value !== null && 'name' in value && typeof value.name === 'string';
}

/** Names on catalog-service's first page, in the order gshop shows them (`GET /catalogs`). */
export async function firstPageProductNames(
  request: APIRequestContext,
  catalogUrl: string,
  limit = 20,
): Promise<string[]> {
  const response = await request.get(`${catalogUrl}/catalogs?limit=${limit}&offset=0`);
  if (!response.ok()) throw new Error(`GET /catalogs -> ${response.status()}`);
  const body: unknown = await response.json();
  if (!Array.isArray(body) || !body.every(isCatalogItem)) {
    throw new Error('GET /catalogs: unexpected response shape (expected [{ name: string }, ...])');
  }
  return body.map((item) => item.name);
}
