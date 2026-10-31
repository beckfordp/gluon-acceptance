import { createBdd, test as base } from 'playwright-bdd';
import { type Order, placeOrder } from './api/orders';
import { catalogProducts } from './api/catalog';
import { allStock } from './api/inventory';
import { signUp } from './api/users';
import { type Config, configFromEnv } from './config';
import { CatalogPage } from './pages/CatalogPage';
import { TestData } from './support/testData';
import {
  type Product,
  type TestCard,
  pickStockedProduct,
  TEST_ADDRESS,
  TEST_CARDS,
  TEST_PASSWORD,
  throwawayEmail,
} from './testData';

/** gshop's anonymous identity (its `src/services/customerId.ts`). */
const CUSTOMER_ID_KEY = 'gshop:customerId';

export interface Shopper {
  customerId: string
}

export interface RegisteredCustomer {
  userId: string
  email: string
  password: string
}

export interface Orders {
  /** Orders placed through the API in this scenario, oldest first. */
  placed: Order[]
  /** Places an order for the stocked product as the shopper (API, like gshop's checkout). */
  place: (options?: { card?: TestCard; quantity?: number }) => Promise<Order>
}

interface Fixtures {
  config: Config
  catalogPage: CatalogPage
  testData: TestData
  shopper: Shopper
  registeredCustomer: RegisteredCustomer
  stockedProduct: Product
  orders: Orders
}

/** The suite's `test`: Playwright's, plus config, test data and page objects, injected into steps. */
export const test = base.extend<Fixtures>({
  // eslint-disable-next-line no-empty-pattern -- Playwright requires the destructuring
  config: async ({}, use) => use(configFromEnv()),
  catalogPage: async ({ page }, use) => use(new CatalogPage(page)),

  testData: [
    async ({ request, config }, use) => {
      const testData = new TestData(request, config);
      await use(testData);
      await testData.cleanUp();
    },
    { auto: true },
  ],

  // A fresh anonymous customer pinned into gshop before any page script runs,
  // so API-placed orders show in this browser's order history.
  shopper: [
    async ({ page, testData }, use) => {
      const customerId = crypto.randomUUID();
      testData.trackCustomer(customerId);
      await page.addInitScript(([key, id]) => window.localStorage.setItem(key, id), [CUSTOMER_ID_KEY, customerId]);
      await use({ customerId });
    },
    { auto: true },
  ],

  registeredCustomer: async ({ request, config, testData }, use) => {
    const email = throwawayEmail();
    const { userId } = await signUp(request, config.serviceUrls.user, email, TEST_PASSWORD);
    testData.trackCustomer(userId);
    await use({ userId, email, password: TEST_PASSWORD });
  },

  stockedProduct: async ({ request, config, testData }, use, testInfo) => {
    const [catalog, stock] = await Promise.all([
      catalogProducts(request, config.serviceUrls.catalog),
      allStock(request, config.serviceUrls.inventory),
    ]);
    const product = pickStockedProduct(catalog, stock, { needed: 2, offset: testInfo.parallelIndex });
    if (product === undefined) throw new Error('No catalog product has stock: re-run seed-watches.sh');
    await testData.snapshotStock(product.sku);
    await use(product);
  },

  orders: async ({ request, config, shopper, stockedProduct }, use) => {
    const placed: Order[] = [];
    const place: Orders['place'] = async ({ card = TEST_CARDS.approve, quantity = 1 } = {}) => {
      const order = await placeOrder(
        request,
        { payment: config.serviceUrls.payment, order: config.serviceUrls.order },
        { customerId: shopper.customerId, product: stockedProduct, quantity, card, address: TEST_ADDRESS },
      );
      placed.push(order);
      return order;
    };
    await use({ placed, place });
  },
});

export const { Given, When, Then } = createBdd(test);
