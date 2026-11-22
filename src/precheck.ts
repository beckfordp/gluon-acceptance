// SPDX-License-Identifier: MIT

import { SERVICES, type Service } from './config';

/** The Debezium outbox connectors every event flow depends on. */
export const OUTBOX_CONNECTORS = [
  'fulfilment-outbox-connector',
  'order-outbox-connector',
  'payment-outbox-connector',
  'user-outbox-connector',
] as const;

/** An HTTP status, or why the request failed. */
export type Outcome = number | string;

export interface ConnectorStatus {
  name: string
  state: string
  taskStates: string[]
}

/** What the precheck observed; the I/O lives in `src/support/globalSetup.ts`. */
export interface PrecheckInput {
  services: { name: string; url: string; outcome: Outcome }[]
  connectors: ConnectorStatus[] | string
  catalogCount: number | string
  /** The services a staged run covers (ACCEPTANCE_SERVICES); undefined = every one. */
  staged?: readonly string[]
}

/**
 * The services a staged run covers, from `ACCEPTANCE_SERVICES` ("cart,catalog" or
 * "cart-service catalog-service"; gluon all-Rust Stage A P0.5), or undefined when it is
 * unset: every service, the original run.
 */
export function stagedServices(env: Record<string, string | undefined>): Service[] | undefined {
  const raw = env.ACCEPTANCE_SERVICES;
  if (raw === undefined) return undefined;
  const names = raw.split(/[\s,]+/).filter((n) => n !== '').map((n) => n.replace(/-service$/, ''));
  if (names.length === 0) throw new Error('ACCEPTANCE_SERVICES is set but lists no service (unset it for every one)');
  const unknown = names.find((n) => !(SERVICES as readonly string[]).includes(n));
  if (unknown !== undefined) {
    throw new Error(`ACCEPTANCE_SERVICES: unknown service '${unknown}' (known: ${SERVICES.join(', ')})`);
  }
  return names as Service[];
}

const CLUSTER_FIX = 'check the cluster is up (bin/k8s-local-up)';
const CONNECTOR_FIX = 're-create connectors (bin/k8s-local-up)';
const SEED_FIX = 'seed it (services/catalog-service/scripts/seed-watches.sh)';

function describeOutcome(outcome: Outcome): string {
  return typeof outcome === 'number' ? `HTTP ${outcome}` : outcome;
}

function connectorProblems(connectors: ConnectorStatus[] | string, staged?: readonly string[]): string[] {
  if (typeof connectors === 'string') return [`Kafka Connect unreachable (${connectors}); ${CLUSTER_FIX}`];
  const byName = new Map(connectors.map((c) => [c.name, c]));
  const wanted = OUTBOX_CONNECTORS.filter(
    (name) => staged === undefined || staged.includes(name.replace(/-outbox-connector$/, '')),
  );
  return wanted.flatMap((name) => {
    const c = byName.get(name);
    if (c === undefined) return [`Debezium connector ${name} is missing; ${CONNECTOR_FIX}`];
    const healthy = c.state === 'RUNNING' && c.taskStates.length > 0
      && c.taskStates.every((t) => t === 'RUNNING');
    const tasks = c.taskStates.length === 0 ? 'none' : c.taskStates.join(', ');
    return healthy ? [] : [`Debezium connector ${name} is ${c.state} (tasks: ${tasks}); ${CONNECTOR_FIX}`];
  });
}

function catalogProblems(count: number | string): string[] {
  if (typeof count === 'string') return [`Catalog unreadable (${count}); ${SEED_FIX}`];
  return count > 0 ? [] : [`Catalog is empty; ${SEED_FIX}`];
}

/**
 * Every reason the cluster can't run the suite, each with its fix; empty when ready. A
 * staged run (`staged`) checks only those services' connectors, and the catalog only
 * when it covers catalog; the services probed are the caller's choice.
 */
export function evaluatePrecheck(input: PrecheckInput): string[] {
  const services = input.services.flatMap((s) =>
    s.outcome === 200
      ? []
      : [`${s.name}-service not ready at ${s.url}/health/ready (${describeOutcome(s.outcome)}); ${CLUSTER_FIX}`],
  );
  const catalog = input.staged === undefined || input.staged.includes('catalog')
    ? catalogProblems(input.catalogCount)
    : [];
  return [...services, ...connectorProblems(input.connectors, input.staged), ...catalog];
}

export function formatPrecheck(problems: string[]): string {
  const noun = problems.length === 1 ? 'problem' : 'problems';
  return [`Acceptance precheck failed (${problems.length} ${noun}):`, ...problems.map((p) => `  - ${p}`)].join('\n');
}
