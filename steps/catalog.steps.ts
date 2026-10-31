import { expect } from '@playwright/test'
import { firstPageProductNames } from '../src/api/catalog'
import { Given, Then, When } from '../src/fixtures'

Given('I open the shop', async ({ catalogPage }) => {
  await catalogPage.open()
})

When('I browse the catalog', async ({ catalogPage }) => {
  await catalogPage.browse()
})

Then('I see products from the catalog', async ({ catalogPage, config, request }) => {
  const names = await firstPageProductNames(request, config.serviceUrls.catalog)
  expect(names, 'catalog-service has no products: seed it first').not.toHaveLength(0)
  await expect(catalogPage.product(names[0])).toBeVisible()
  await expect(catalogPage.productNames).toHaveCount(names.length)
})
