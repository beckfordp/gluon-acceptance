import type { APIRequestContext } from '@playwright/test';
import type { Product, TestCard } from '../testData';
import { arrayOf, expectStatus, hasFields, isRecord, readJson } from './shape';

export interface Order {
  id: string
  customerId: string
  status: string
  totalCents: number
}

/** Statuses an order never leaves, so it is safe to delete. */
export const TERMINAL_ORDER_STATUSES: readonly string[] = [
  'confirmed',
  'payment_failed',
  'dispatch_failed',
  'cancelled',
];

function isOrder(value: unknown): value is Order {
  return hasFields(value, { id: 'string', customerId: 'string', status: 'string', totalCents: 'number' });
}

function pick({ id, customerId, status, totalCents }: Order): Order {
  return { id, customerId, status, totalCents };
}

export interface Address {
  line1: string
  city: string
  postcode: string
  country: string
}

function wireAddress(a: Address): Record<string, string> {
  return { line1: a.line1, city: a.city, postalCode: a.postcode, country: a.country };
}

/** `POST /payments/methods` then `POST /orders`, as gshop's checkout does. */
export async function placeOrder(
  request: APIRequestContext,
  urls: { payment: string; order: string },
  order: { customerId: string; product: Product; quantity: number; card: TestCard; address: Address },
): Promise<Order> {
  const method = await readJson(
    await request.post(`${urls.payment}/payments/methods`, {
      data: {
        customerId: order.customerId,
        cardNumber: order.card.number.replaceAll(' ', ''),
        expiry: order.card.expiry,
        billingAddress: wireAddress(order.address),
      },
    }),
    'POST /payments/methods',
    (v: unknown): v is { id: string } => isRecord(v) && typeof v.id === 'string',
  );
  const response = await request.post(`${urls.order}/orders`, {
    data: {
      customerId: order.customerId,
      items: [{
        sku: order.product.sku,
        productName: order.product.name,
        quantity: order.quantity,
        unitPriceCents: order.product.priceCents,
      }],
      shippingAddress: wireAddress(order.address),
      paymentMethodId: method.id,
    },
  });
  return pick(await readJson(response, 'POST /orders', isOrder));
}

export async function ordersFor(request: APIRequestContext, orderUrl: string, customerId: string): Promise<Order[]> {
  const response = await request.get(`${orderUrl}/orders?customerId=${encodeURIComponent(customerId)}`);
  return (await readJson(response, `GET /orders?customerId=${customerId}`, arrayOf(isOrder))).map(pick);
}

/** The order, or `undefined` once it's gone (404). */
export async function findOrder(request: APIRequestContext, orderUrl: string, id: string): Promise<Order | undefined> {
  const response = await request.get(`${orderUrl}/orders/${id}`);
  if (response.status() === 404) return undefined;
  return pick(await readJson(response, `GET /orders/${id}`, isOrder));
}

export async function deleteOrder(request: APIRequestContext, orderUrl: string, id: string): Promise<void> {
  await expectStatus(await request.delete(`${orderUrl}/orders/${id}`), `DELETE /orders/${id}`, 204, 404);
}
