import type { APIResponse } from '@playwright/test';

type FieldType = 'string' | 'number';
type Typed<F extends Record<string, FieldType>> = { [K in keyof F]: F[K] extends 'string' ? string : number };

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Narrows `value` to an object whose named fields have the given primitive types. */
export function hasFields<F extends Record<string, FieldType>>(value: unknown, fields: F): value is Typed<F> {
  return isRecord(value) && Object.entries(fields).every(([key, type]) => typeof value[key] === type);
}

export function arrayOf<T>(guard: (value: unknown) => value is T): (value: unknown) => value is T[] {
  return (value: unknown): value is T[] => Array.isArray(value) && value.every(guard);
}

/** The response body, after checking the status is 2xx and the body has the expected shape. */
export async function readJson<T>(
  response: APIResponse,
  what: string,
  guard: (value: unknown) => value is T,
): Promise<T> {
  if (!response.ok()) throw new Error(`${what} -> HTTP ${response.status()}: ${await response.text()}`);
  const body: unknown = await response.json();
  if (!guard(body)) throw new Error(`${what}: unexpected response shape: ${JSON.stringify(body).slice(0, 300)}`);
  return body;
}

export async function expectStatus(response: APIResponse, what: string, ...statuses: number[]): Promise<void> {
  if (!statuses.includes(response.status())) {
    throw new Error(`${what} -> HTTP ${response.status()} (wanted ${statuses.join('/')}): ${await response.text()}`);
  }
}
