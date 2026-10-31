import { createBdd, test as base } from 'playwright-bdd';
import { type Config, configFromEnv } from './config';
import { CatalogPage } from './pages/CatalogPage';

interface Fixtures {
  config: Config
  catalogPage: CatalogPage
}

/** The suite's `test`: Playwright's, plus config and page objects, injected into steps. */
export const test = base.extend<Fixtures>({
  // eslint-disable-next-line no-empty-pattern -- Playwright requires the destructuring
  config: async ({}, use) => use(configFromEnv()),
  catalogPage: async ({ page }, use) => use(new CatalogPage(page)),
});

export const { Given, When, Then } = createBdd(test);
