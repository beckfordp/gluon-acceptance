/**
 * Every Gluon service the suite (or gshop) talks to. Each defaults to its
 * in-cluster DNS name, which OrbStack also resolves on the Mac host (ADR
 * 0002), so no port-forwards are needed. Same URLs as gshop's own `.env`.
 */
export const SERVICES = [
  'order',
  'payment',
  'inventory',
  'user',
  'catalog',
  'fulfilment',
  'cart',
  'notification',
] as const

export type Service = (typeof SERVICES)[number]

/** Suite configuration: where gshop runs, where its source is, and each service's base URL. */
export interface Config {
  gshopUrl: string
  gshopDir: string
  serviceUrls: Record<Service, string>
}

export interface ConfigError {
  key: string
  value: string
  message: string
}

export type ConfigResult =
  | { ok: true; config: Config }
  | { ok: false; errors: ConfigError[] }

type Env = Record<string, string | undefined>
type Parsed<T> = { ok: true; value: T } | { ok: false; error: ConfigError }

const DEFAULT_GSHOP_URL = 'http://localhost:5173'
const DEFAULT_GSHOP_DIR = '../../frontends/gshop'

const envKey = (service: Service): string => `${service.toUpperCase()}_URL`

const clusterUrl = (service: Service): string =>
  `http://${service}-service.gluon-local.svc.cluster.local:8080`

/** Unset and empty both mean "use the default". */
const lookup = (env: Env, key: string): string | undefined => {
  const value = env[key]
  return value === undefined || value === '' ? undefined : value
}

const parseUrl = (key: string, raw: string): Parsed<string> => {
  const trimmed = raw.trim().replace(/\/$/, '')
  const invalid: Parsed<string> = {
    ok: false,
    error: { key, value: raw, message: `${key}: '${raw}' is not an absolute http(s) URL` },
  }
  try {
    const url = new URL(trimmed)
    const httpish = url.protocol === 'http:' || url.protocol === 'https:'
    return httpish && url.hostname !== '' ? { ok: true, value: trimmed } : invalid
  } catch {
    return invalid
  }
}

const urlOrDefault = (env: Env, key: string, fallback: string): Parsed<string> => {
  const raw = lookup(env, key)
  return raw === undefined ? { ok: true, value: fallback } : parseUrl(key, raw)
}

const parseDir = (env: Env): Parsed<string> => {
  const raw = lookup(env, 'GSHOP_DIR')
  if (raw === undefined) return { ok: true, value: DEFAULT_GSHOP_DIR }
  return raw.trim() === ''
    ? { ok: false, error: { key: 'GSHOP_DIR', value: raw, message: 'GSHOP_DIR: must not be blank' } }
    : { ok: true, value: raw }
}

/**
 * Reads the suite's config from env vars: `GSHOP_URL`, `GSHOP_DIR` and
 * `<SERVICE>_URL` per service, defaulting to a local gshop and in-cluster
 * service DNS names. Collects every error rather than stopping at the first.
 */
export function loadConfig(env: Env): ConfigResult {
  const gshopUrl = urlOrDefault(env, 'GSHOP_URL', DEFAULT_GSHOP_URL)
  const gshopDir = parseDir(env)
  const services = SERVICES.map(
    (s) => [s, urlOrDefault(env, envKey(s), clusterUrl(s))] as const,
  )

  const errors = [gshopUrl, gshopDir, ...services.map(([, p]) => p)].flatMap((p) =>
    p.ok ? [] : [p.error],
  )
  if (errors.length > 0 || !gshopUrl.ok || !gshopDir.ok) return { ok: false, errors }

  const serviceUrls = Object.fromEntries(
    services.map(([name, p]) => [name, p.ok ? p.value : '']),
  ) as Record<Service, string>
  return { ok: true, config: { gshopUrl: gshopUrl.value, gshopDir: gshopDir.value, serviceUrls } }
}

/** The `VITE_<NAME>_SERVICE_URL` vars gshop reads (its `src/services/env.ts`). */
export function viteEnv(config: Config): Record<string, string> {
  return Object.fromEntries(
    SERVICES.map((s) => [`VITE_${s.toUpperCase()}_SERVICE_URL`, config.serviceUrls[s]]),
  )
}

/** Config boundary: returns the config, or throws one error listing every problem. */
export function configFromEnv(env: Env = process.env): Config {
  const result = loadConfig(env)
  if (result.ok) return result.config
  throw new Error(`Invalid configuration:\n${result.errors.map((e) => `  ${e.message}`).join('\n')}`)
}
