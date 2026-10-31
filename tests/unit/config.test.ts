import { describe, expect, it } from 'vitest';
import { SERVICES, configFromEnv, loadConfig, viteEnv } from '../../src/config';

const clusterUrl = (name: string) => `http://${name}-service.gluon-local.svc.cluster.local:8080`;

const expectedDefaults = {
  order: clusterUrl('order'),
  payment: clusterUrl('payment'),
  inventory: clusterUrl('inventory'),
  user: clusterUrl('user'),
  catalog: clusterUrl('catalog'),
  fulfilment: clusterUrl('fulfilment'),
  cart: clusterUrl('cart'),
  notification: clusterUrl('notification'),
};

describe('loadConfig', () => {
  it('defaults gshop locally and every service to its OrbStack cluster DNS name', () => {
    const result = loadConfig({});
    expect(result).toEqual({
      ok: true,
      config: {
        gshopUrl: 'http://localhost:5173',
        gshopDir: '../../frontends/gshop',
        kafkaConnectUrl: 'http://kafka-connect.gluon-local.svc.cluster.local:8083',
        serviceUrls: expectedDefaults,
      },
    });
  });

  it('treats empty values as unset', () => {
    const result = loadConfig({ GSHOP_URL: '', ORDER_URL: '' });
    expect(result.ok && result.config.gshopUrl).toBe('http://localhost:5173');
    expect(result.ok && result.config.serviceUrls.order).toBe(clusterUrl('order'));
  });

  it('applies overrides and strips a trailing slash', () => {
    const result = loadConfig({
      GSHOP_URL: 'http://gshop.test:3000/',
      GSHOP_DIR: '/tmp/gshop',
      CATALOG_URL: 'https://catalog.test/',
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.config.gshopUrl).toBe('http://gshop.test:3000');
    expect(result.config.gshopDir).toBe('/tmp/gshop');
    expect(result.config.serviceUrls.catalog).toBe('https://catalog.test');
    expect(result.config.serviceUrls.order).toBe(clusterUrl('order'));
  });

  it('accumulates every invalid URL rather than stopping at the first', () => {
    const result = loadConfig({ ORDER_URL: 'nope', CART_URL: 'ftp://cart.test' });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors.map((e) => e.key)).toEqual(['ORDER_URL', 'CART_URL']);
    expect(result.errors[0].message).toContain('ORDER_URL');
    expect(result.errors[0].message).toContain("'nope'");
  });

  it('rejects a URL with no host', () => {
    const result = loadConfig({ GSHOP_URL: 'http://' });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors.map((e) => e.key)).toEqual(['GSHOP_URL']);
  });

  it('overrides and validates KAFKA_CONNECT_URL', () => {
    const ok = loadConfig({ KAFKA_CONNECT_URL: 'http://connect.test:8083/' });
    expect(ok.ok && ok.config.kafkaConnectUrl).toBe('http://connect.test:8083');
    const bad = loadConfig({ KAFKA_CONNECT_URL: 'connect' });
    expect(!bad.ok && bad.errors.map((e) => e.key)).toEqual(['KAFKA_CONNECT_URL']);
  });

  it('rejects a blank GSHOP_DIR', () => {
    const result = loadConfig({ GSHOP_DIR: '   ' });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors.map((e) => e.key)).toEqual(['GSHOP_DIR']);
  });
});

describe('viteEnv', () => {
  it('maps every service to its VITE_<NAME>_SERVICE_URL', () => {
    const result = loadConfig({ USER_URL: 'http://user.test' });
    if (!result.ok) throw new Error('expected valid config');
    const env = viteEnv(result.config);
    expect(Object.keys(env)).toHaveLength(SERVICES.length + 2);
    expect(env.VITE_USER_SERVICE_URL).toBe('http://user.test');
    expect(env.VITE_FULFILMENT_SERVICE_URL).toBe(clusterUrl('fulfilment'));
  });

  it('pins gshop to its real clients, never the in-browser mocks', () => {
    const result = loadConfig({});
    if (!result.ok) throw new Error('expected valid config');
    const env = viteEnv(result.config);
    expect(env.VITE_CHECKOUT_MOCK).toBe('false');
    expect(env.VITE_AUTH_MOCK).toBe('false');
  });
});

describe('configFromEnv', () => {
  it('returns the config when valid', () => {
    expect(configFromEnv({}).serviceUrls).toEqual(expectedDefaults);
  });

  it('throws one error listing every problem', () => {
    expect(() => configFromEnv({ ORDER_URL: 'nope', GSHOP_DIR: ' ' })).toThrow(
      /ORDER_URL[\s\S]*GSHOP_DIR|GSHOP_DIR[\s\S]*ORDER_URL/,
    );
  });
});
