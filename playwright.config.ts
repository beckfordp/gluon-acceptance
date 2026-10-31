import path from 'node:path';
import { defineConfig, devices } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';
import { configFromEnv, viteEnv } from './src/config';

// Fails fast, listing every bad env var.
const config = configFromEnv();

const testDir = defineBddConfig({
  features: 'features/**/*.feature',
  steps: ['steps/**/*.ts', 'src/fixtures.ts'],
});

const port = new URL(config.gshopUrl).port || '80';

export default defineConfig({
  testDir,
  // Stops the run before the first scenario if the cluster isn't ready.
  globalSetup: './src/support/globalSetup.ts',
  retries: 0,
  // The local cluster's services run on small CPU limits: at the default
  // (half the cores) order-service fails its liveness probe and restarts
  // mid-run, so gshop's fetches fail. Two workers keep it stable.
  workers: 2,
  forbidOnly: !!process.env.CI,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: config.gshopUrl,
    trace: 'retain-on-failure',
    // SLOW_MO (ms) slows each browser action so a headed run can be followed.
    launchOptions: { slowMo: Number(process.env.SLOW_MO ?? 0) },
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
