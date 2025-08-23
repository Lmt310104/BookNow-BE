// http-metrics.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { httpRequestDuration, httpRequestsTotal } from '../../metrics';

@Injectable()
export class HttpMetricsMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    const start = process.hrtime.bigint();

    res.on('finish', () => {
      const end = process.hrtime.bigint();
      const seconds = Number(end - start) / 1e9;

      // route có thể là req.route?.path (Express) hoặc req.originalUrl - tùy adapter
      const route = req.route?.path || req.originalUrl || 'unknown';
      const labels = {
        method: req.method,
        route,
        status_code: String(res.statusCode),
      };

      httpRequestsTotal.inc(labels);
      httpRequestDuration.observe(labels, seconds);
    });

    next();
  }
}
