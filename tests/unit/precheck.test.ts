import { describe, expect, it } from 'vitest';
import { OUTBOX_CONNECTORS, evaluatePrecheck, formatPrecheck, type PrecheckInput } from '../../src/precheck';

const running = OUTBOX_CONNECTORS.map((name) => ({ name, state: 'RUNNING', taskStates: ['RUNNING'] }));

const healthy: PrecheckInput = {
  services: [
    { name: 'order', url: 'http://order:8080', outcome: 200 },
    { name: 'user', url: 'http://user:8080', outcome: 200 },
  ],
  connectors: running,
  catalogCount: 100,
};

describe('evaluatePrecheck', () => {
  it('finds no problems when everything is ready', () => {
    expect(evaluatePrecheck(healthy)).toEqual([]);
  });

  it('reports a service that is not ready, or unreachable', () => {
    const problems = evaluatePrecheck({
      ...healthy,
      services: [
        { name: 'order', url: 'http://localhost:1', outcome: 'connect ECONNREFUSED' },
        { name: 'user', url: 'http://user:8080', outcome: 503 },
      ],
    });
    expect(problems).toEqual([
      'order-service not ready at http://localhost:1/health/ready (connect ECONNREFUSED); check the cluster is up (bin/k8s-local-up)',
      'user-service not ready at http://user:8080/health/ready (HTTP 503); check the cluster is up (bin/k8s-local-up)',
    ]);
  });

  it('reports missing and stopped connectors, including failed tasks', () => {
    const problems = evaluatePrecheck({
      ...healthy,
      connectors: [
        { name: 'order-outbox-connector', state: 'RUNNING', taskStates: ['FAILED'] },
        { name: 'payment-outbox-connector', state: 'PAUSED', taskStates: [] },
        ...running.slice(4),
      ],
    });
    expect(problems).toEqual([
      'Debezium connector fulfilment-outbox-connector is missing; re-create connectors (bin/k8s-local-up)',
      'Debezium connector inventory-outbox-connector is missing; re-create connectors (bin/k8s-local-up)',
      'Debezium connector order-outbox-connector is RUNNING (tasks: FAILED); re-create connectors (bin/k8s-local-up)',
      'Debezium connector payment-outbox-connector is PAUSED (tasks: none); re-create connectors (bin/k8s-local-up)',
    ]);
  });

  it('reports Kafka Connect itself being unreachable once', () => {
    expect(evaluatePrecheck({ ...healthy, connectors: 'HTTP 500' })).toEqual([
      'Kafka Connect unreachable (HTTP 500); check the cluster is up (bin/k8s-local-up)',
    ]);
  });

  it('reports an empty or unreadable catalog', () => {
    const fix = 'seed it (services/catalog-service/scripts/seed-watches.sh)';
    expect(evaluatePrecheck({ ...healthy, catalogCount: 0 })).toEqual([`Catalog is empty; ${fix}`]);
    expect(evaluatePrecheck({ ...healthy, catalogCount: 'HTTP 502' }))
      .toEqual([`Catalog unreadable (HTTP 502); ${fix}`]);
  });
});

describe('formatPrecheck', () => {
  it('lists every problem under one heading', () => {
    expect(formatPrecheck(['a', 'b'])).toBe('Acceptance precheck failed (2 problems):\n  - a\n  - b');
    expect(formatPrecheck(['a'])).toBe('Acceptance precheck failed (1 problem):\n  - a');
  });
});
