import { request as playwrightRequest } from '@playwright/test';
import { configFromEnv, SERVICES } from '../config';
import { connectorStatuses } from '../api/connect';
import { evaluatePrecheck, formatPrecheck, type Outcome } from '../precheck';

/** The first line of a request failure, minus Playwright's method prefix. */
function reason(error: unknown): string {
  const message = error instanceof Error ? error.message.split('\n')[0] : String(error);
  return message.replace(/^apiRequestContext\.\w+: /, '');
}

/**
 * Playwright `globalSetup`: stops the run before the first scenario, with one
 * message listing every problem and its fix, when the cluster isn't ready.
 * The default export is what Playwright requires of a globalSetup module.
 */
export default async function precheck(): Promise<void> {
  const config = configFromEnv();
  const request = await playwrightRequest.newContext({ timeout: 5_000 });
  try {
    const services = await Promise.all(SERVICES.map(async (name) => {
      const url = config.serviceUrls[name];
      const outcome: Outcome = await request.get(`${url}/health/ready`)
        .then((r) => r.status(), reason);
      return { name, url, outcome };
    }));
    const connectors = await connectorStatuses(request, config.kafkaConnectUrl).catch(reason);
    const catalogCount = await request.get(`${config.serviceUrls.catalog}/catalogs?limit=1&offset=0`)
      .then((r) => (r.ok() ? Number(r.headers()['x-total-count'] ?? 0) : `HTTP ${r.status()}`), reason);

    const problems = evaluatePrecheck({ services, connectors, catalogCount });
    if (problems.length > 0) throw new Error(formatPrecheck(problems));
  } finally {
    await request.dispose();
  }
}
