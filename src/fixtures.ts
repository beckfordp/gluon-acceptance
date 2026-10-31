import { createBdd, test as base } from 'playwright-bdd';
import { findOrder, type Order, placeOrder } from './api/orders';
import { catalogProducts } from './api/catalog';
import { allStock, type StockRow } from './api/inventory';
import { signUp } from './api/users';
import { type Config, configFromEnv } from './config';
import { AuthDialog } from './pages/AuthDialog';
import { CartPage } from './pages/CartPage';
import { CatalogPage } from './pages/CatalogPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { ConfirmationPage } from './pages/ConfirmationPage';
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

/** A product with stock, and its inventory row as it was before the scenario. */
export interface StockedProduct extends Product {
  stock: StockRow
}

export interface Orders {
  /** Orders placed in this scenario (API or UI), oldest first. */
  placed: Order[]
  /** Places an order for the stocked product as the shopper (API, like gshop's checkout). */
  place: (options?: { card?: TestCard; quantity?: number }) => Promise<Order>
  /** Adds an order placed through the UI, fetched from order-service. */
  record: (orderId: string) => Promise<Order>
}

/** Values one step leaves for a later one in the same scenario. */
export interface Scenario {
  /** The email the shopper signed up or in with. */
  email?: string
}

interface Fixtures {
  config: Config
  scenario: Scenario
  catalogPage: CatalogPage
  cartPage: CartPage
  checkoutPage: CheckoutPage
  confirmationPage: ConfirmationPage
  authDialog: AuthDialog
  testData: TestData
  shopper: Shopper
  registeredCustomer: RegisteredCustomer
  stockedProduct: StockedProduct
  orders: Orders
}

/** The suite's `test`: Playwright's, plus config, test data and page objects, injected into steps. */
export const test = base.extend<Fixtures>({
  // eslint-disable-next-line no-empty-pattern -- Playwright requires the destructuring
  config: async ({}, use) => use(configFromEnv()),
  catalogPage: async ({ page }, use) => use(new CatalogPage(page)),
  cartPage: async ({ page }, use) => use(new CartPage(page)),
  checkoutPage: async ({ page }, use) => use(new CheckoutPage(page)),
  confirmationPage: async ({ page }, use) => use(new ConfirmationPage(page)),
  authDialog: async ({ page }, use) => use(new AuthDialog(page)),
  // eslint-disable-next-line no-empty-pattern -- Playwright requires the destructuring
  scenario: async ({}, use) => use({}),

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
    const [catalog, inventory] = await Promise.all([
      // gshop's first page, so the product is on screen without paging.
      catalogProducts(request, config.serviceUrls.catalog, 20),
      allStock(request, config.serviceUrls.inventory),
    ]);
    const product = pickStockedProduct(catalog, inventory, { needed: 2, offset: testInfo.parallelIndex });
    if (product === undefined) throw new Error('No catalog product has stock: re-run seed-watches.sh');
    const stock = await testData.snapshotStock(product.sku);
    await use({ ...product, stock });
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
    const record: Orders['record'] = async (orderId) => {
      const order = await findOrder(request, config.serviceUrls.order, orderId);
      if (order === undefined) throw new Error(`Order ${orderId} not found in order-service`);
      placed.push(order);
      return order;
    };
    await use({ placed, place, record });
  },
});

export const { Given, When, Then } = createBdd(test);
