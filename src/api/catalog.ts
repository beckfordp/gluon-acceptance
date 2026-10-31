import type { APIRequestContext } from '@playwright/test'

interface CatalogItem {
  name: string
}

/** Names on catalog-service's first page, in the order gshop shows them (`GET /catalogs`). */
export async function firstPageProductNames(
  request: APIRequestContext,
  catalogUrl: string,
  limit = 20,
): Promise<string[]> {
  const response = await request.get(`${catalogUrl}/catalogs?limit=${limit}&offset=0`)
  if (!response.ok()) throw new Error(`GET /catalogs -> ${response.status()}`)
  const items = (await response.json()) as CatalogItem[]
  return items.map((item) => item.name)
}
