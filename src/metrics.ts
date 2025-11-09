// metrics.ts
import * as prom from 'prom-client';

export const registry = new prom.Registry();
prom.collectDefaultMetrics({ register: registry });

export const httpRequestDuration = new prom.Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration',
  labelNames: ['method', 'route', 'status_code'] as const,
  buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2, 5],
});

export const httpRequestsTotal = new prom.Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'route', 'status_code'] as const,
});

registry.registerMetric(httpRequestDuration);
registry.registerMetric(httpRequestsTotal);
