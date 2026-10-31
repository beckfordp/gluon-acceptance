import type { APIRequestContext } from '@playwright/test';
import type { ConnectorStatus } from '../precheck';
import { isRecord, readJson } from './shape';

type ExpandedStatuses = Record<string, { status: { connector: { state: string }; tasks: { state: string }[] } }>;

function isExpandedStatuses(value: unknown): value is ExpandedStatuses {
  return isRecord(value) && Object.values(value).every((entry) =>
    isRecord(entry) && isRecord(entry.status) && isRecord(entry.status.connector)
      && typeof entry.status.connector.state === 'string'
      && Array.isArray(entry.status.tasks)
      && entry.status.tasks.every((t) => isRecord(t) && typeof t.state === 'string'),
  );
}

/** Kafka Connect's connectors and their task states (`GET /connectors?expand=status`). */
export async function connectorStatuses(request: APIRequestContext, connectUrl: string): Promise<ConnectorStatus[]> {
  const body = await readJson(
    await request.get(`${connectUrl}/connectors?expand=status`),
    'GET /connectors?expand=status',
    isExpandedStatuses,
  );
  return Object.entries(body).map(([name, { status }]) => ({
    name,
    state: status.connector.state,
    taskStates: status.tasks.map((t) => t.state),
  }));
}
