// main.ts
import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule } from '@nestjs/swagger';
import documentation from './config/documentation';
import { END_POINTS } from './utils/constants';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { AuthenticationGuard } from './common/guards/authentication.guard';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import InitFirebase from './services/firebase';
import { registry } from './metrics';

// security & perf
import helmet from 'helmet';
import * as compression from 'compression';

// prometheus
import * as prom from 'prom-client';

async function bootstrap() {
  // bufferLogs để logger init sớm, tránh mất log khi lỗi bootstrap
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  const config = app.get(ConfigService);
  const port = Number(config.get<string>('port')) || 8080;
  const nodeEnv = (
    config.get<string>('NODE_ENV') || 'development'
  ).toLowerCase();

  // ===== Security & Perf =====
  app.use(helmet());
  app.use(compression());
  app.use(cookieParser(config.get<string>('COOKIE_SECRET') || undefined));

  // CORS: nên whitelist domain
  const corsOrigins = (config.get<string>('CORS_ORIGINS') || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  app.enableCors({
    origin: corsOrigins.length ? corsOrigins : true, // dev: true; prod: whitelist
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
    ],
  });

  // ===== Global prefix & versioning =====
  app.setGlobalPrefix(END_POINTS.BASE); // ví dụ: /api
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' }); // /api/v1

  // ===== Validation & Logging & Guards =====
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalInterceptors(new LoggingInterceptor());
  const reflector = app.get(Reflector);
  app.useGlobalGuards(new AuthenticationGuard(reflector));
  // Lưu ý: AuthenticationGuard nên có @Public() metadata để bỏ qua /health, /metrics, /docs

  // ===== Healthcheck =====
  const httpAdapter = app.getHttpAdapter();
  httpAdapter.get('/health', (_req, res) =>
    res.status(200).send({ status: 'ok' }),
  );

  // ===== Prometheus metrics =====
  const register = new prom.Registry();
  prom.collectDefaultMetrics({ register }); // CPU, mem, GC, event loop, …
  httpAdapter.get('/metrics', async (_req, res) => {
    res.setHeader('Content-Type', registry.contentType);
    res.end(await registry.metrics());
  });

  // ===== Swagger (tắt ở production) =====
  if (nodeEnv !== 'production') {
    const doc = SwaggerModule.createDocument(app, documentation, {
      ignoreGlobalPrefix: true,
    });
    SwaggerModule.setup('docs', app, doc);
  }

  // ===== Firebase (nếu cần) =====
  InitFirebase();

  // ===== Graceful shutdown =====
  app.enableShutdownHooks();

  await app.listen(port, '0.0.0.0');
  if (nodeEnv !== 'production') {
    console.log(`Docs: http://localhost:${port}/docs`);
  }
  // eslint-disable-next-line no-console
  console.log(
    `Health: http://localhost:${port}/health  |  Metrics: http://localhost:${port}/metrics`,
  );
}

bootstrap();
