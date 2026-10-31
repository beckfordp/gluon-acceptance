import path from 'node:path'
import { defineConfig, devices } from '@playwright/test'
import { defineBddConfig } from 'playwright-bdd'
import { configFromEnv, viteEnv } from './src/config'

// Fails fast, listing every bad env var.
const config = configFromEnv()

const testDir = defineBddConfig({
  features: 'features/**/*.feature',
  steps: ['steps/**/*.ts', 'src/fixtures.ts'],
})

const port = new URL(config.gshopUrl).port || '80'

export default defineConfig({
  testDir,
  retries: 0,
  forbidOnly: !!process.env.CI,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: config.gshopUrl,
    trace: 'retain-on-failure',
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
})
