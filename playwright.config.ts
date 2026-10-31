import { lookup } from 'node:dns/promises';
import path from 'node:path';
import { defineConfig, devices } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';
import { configFromEnv, hostResolverRules, serviceHosts, viteEnv } from './src/config';

// Fails fast, listing every bad env var.
const config = configFromEnv();

const testDir = defineBddConfig({
  features: 'features/**/*.feature',
  steps: ['steps/**/*.ts', 'src/fixtures.ts'],
});

const port = new URL(config.gshopUrl).port || '80';

// Resolved once here (the OS resolver) and pinned in Chromium. A host that
// doesn't resolve (CI, cluster down) is left out; globalSetup's precheck
// reports it.
const addresses = Object.fromEntries((await Promise.all(
  serviceHosts(config).map(async (host) => {
    try {
      return [[host, (await lookup(host)).address]];
    } catch {
      return [];
    }
  }),
)).flat());

export default defineConfig({
  testDir,
  // Stops the run before the first scenario if the cluster isn't ready.
  globalSetup: './src/support/globalSetup.ts',
  retries: 0,
  // The local cluster's services run on small CPU limits: at the default
  // (half the cores) order-service fails its liveness probe and restarts.
  workers: 2,
  forbidOnly: !!process.env.CI,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: config.gshopUrl,
    trace: 'retain-on-failure',
    // SLOW_MO (ms) slows each browser action so a headed run can be followed.
    launchOptions: { slowMo: Number(process.env.SLOW_MO ?? 0), args: hostResolverRules(addresses) },
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  // gshop's Vite dev server, wired to the real services. Process env wins
  // over gshop's own .env, so these URLs are the ones it uses. --strictPort
  // fails loudly if the port is taken rather than moving to another one.
  webServer: {
    command: `npm run dev -- --port ${port} --strictPort`,
    cwd: path.resolve(import.meta.dirname, config.gshopDir),
    env: viteEnv(config),
    url: config.gshopUrl,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
