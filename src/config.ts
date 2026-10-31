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
] as const;

export type Service = (typeof SERVICES)[number];

/** Suite configuration: where gshop runs, where its source is, Kafka Connect's and each service's base URL. */
export interface Config {
  gshopUrl: string
  gshopDir: string
  kafkaConnectUrl: string
  serviceUrls: Record<Service, string>
}

export interface ConfigError {
  key: string
  value: string
  message: string
}

export type ConfigResult =
  | { ok: true; config: Config }
  | { ok: false; errors: ConfigError[] };

type Env = Record<string, string | undefined>;
type Parsed<T> = { ok: true; value: T } | { ok: false; error: ConfigError };

const DEFAULT_GSHOP_URL = 'http://localhost:5173';
const DEFAULT_GSHOP_DIR = '../../frontends/gshop';
const DEFAULT_KAFKA_CONNECT_URL = 'http://kafka-connect.gluon-local.svc.cluster.local:8083';

function envKey(service: Service): string {
  return `${service.toUpperCase()}_URL`;
}

function clusterUrl(service: Service): string {
  return `http://${service}-service.gluon-local.svc.cluster.local:8080`;
}

/** Unset and empty both mean "use the default". */
function lookup(env: Env, key: string): string | undefined {
  const value = env[key];
  return value === undefined || value === '' ? undefined : value;
}

function parseUrl(key: string, raw: string): Parsed<string> {
  const trimmed = raw.trim().replace(/\/$/, '');
  const invalid: Parsed<string> = {
    ok: false,
    error: { key, value: raw, message: `${key}: '${raw}' is not an absolute http(s) URL` },
  };
  try {
    const url = new URL(trimmed);
    const httpish = url.protocol === 'http:' || url.protocol === 'https:';
    return httpish && url.hostname !== '' ? { ok: true, value: trimmed } : invalid;
  } catch {
    return invalid;
  }
}

function urlOrDefault(env: Env, key: string, fallback: string): Parsed<string> {
  const raw = lookup(env, key);
  return raw === undefined ? { ok: true, value: fallback } : parseUrl(key, raw);
}

function parseDir(env: Env): Parsed<string> {
  const raw = lookup(env, 'GSHOP_DIR');
  if (raw === undefined) return { ok: true, value: DEFAULT_GSHOP_DIR };
  return raw.trim() === ''
    ? { ok: false, error: { key: 'GSHOP_DIR', value: raw, message: 'GSHOP_DIR: must not be blank' } }
    : { ok: true, value: raw };
}

/**
 * Reads the suite's config from env vars: `GSHOP_URL`, `GSHOP_DIR`,
 * `KAFKA_CONNECT_URL` and `<SERVICE>_URL` per service, defaulting to a local
 * gshop and in-cluster DNS names. Collects every error rather than stopping at the first.
 */
export function loadConfig(env: Env): ConfigResult {
  const gshopUrl = urlOrDefault(env, 'GSHOP_URL', DEFAULT_GSHOP_URL);
  const gshopDir = parseDir(env);
  const kafkaConnectUrl = urlOrDefault(env, 'KAFKA_CONNECT_URL', DEFAULT_KAFKA_CONNECT_URL);
  const services = SERVICES.map(
    (s) => [s, urlOrDefault(env, envKey(s), clusterUrl(s))] as const,
  );

  const errors = [gshopUrl, gshopDir, kafkaConnectUrl, ...services.map(([, p]) => p)].flatMap((p) =>
    p.ok ? [] : [p.error],
  );
  if (errors.length > 0 || !gshopUrl.ok || !gshopDir.ok || !kafkaConnectUrl.ok) {
    return { ok: false, errors };
  }

  // No errors, so every entry parsed; `''` never occurs. The assertion is safe:
  // `services` maps over SERVICES, so every Service key is present.
  const serviceUrls = Object.fromEntries(
    services.map(([name, p]) => [name, p.ok ? p.value : '']),
  ) as Record<Service, string>;
  return {
    ok: true,
    config: {
      gshopUrl: gshopUrl.value,
      gshopDir: gshopDir.value,
      kafkaConnectUrl: kafkaConnectUrl.value,
      serviceUrls,
    },
  };
}

/**
 * The env gshop reads (its `src/services/env.ts`): `VITE_<NAME>_SERVICE_URL`
 * per service, plus its mock flags pinned off so checkout and auth always hit
 * the real services.
 */
export function viteEnv(config: Config): Record<string, string> {
  return {
    ...Object.fromEntries(
      SERVICES.map((s) => [`VITE_${s.toUpperCase()}_SERVICE_URL`, config.serviceUrls[s]]),
    ),
    VITE_CHECKOUT_MOCK: 'false',
    VITE_AUTH_MOCK: 'false',
  };
}

/** Each service URL's host, once. */
export function serviceHosts(config: Config): string[] {
  return [...new Set(SERVICES.map((s) => new URL(config.serviceUrls[s]).hostname))];
}

/**
 * Chromium's `--host-resolver-rules` pinning each host to its address, so the
 * browser never resolves `*.cluster.local` itself: under load its lookups
 * intermittently time out as `ERR_NAME_NOT_RESOLVED`. No flag when empty.
 */
export function hostResolverRules(addresses: Record<string, string>): string[] {
  const rules = Object.entries(addresses).map(([host, address]) => `MAP ${host} ${address}`);
  return rules.length === 0 ? [] : [`--host-resolver-rules=${rules.join(', ')}`];
}

/** Config boundary: returns the config, or throws one error listing every problem. */
export function configFromEnv(env: Env = process.env): Config {
  const result = loadConfig(env);
  if (result.ok) return result.config;
  throw new Error(`Invalid configuration:\n${result.errors.map((e) => `  ${e.message}`).join('\n')}`);
}
