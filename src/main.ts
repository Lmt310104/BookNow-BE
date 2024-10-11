import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule } from '@nestjs/swagger';
import documentation from './config/documentation';
import { END_POINTS } from './utils/constants';
import * as cookieParser from 'cookie-parser';
import { HttpExceptionFilter } from './common/exception-filter/http-exception.filter';
import { AuthenticationGuard } from './common/guards/authentication.guard';
// import { RefreshTokenGuard } from './common/guards/refreshtoken.guard';
import InitFirebase from './services/firebase';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get<string>('port');
  const reflector = app.get('Reflector');
  const document = SwaggerModule.createDocument(app, documentation, {
    ignoreGlobalPrefix: true,
  });
  app.enableCors({
    origin: true,
    credentials: true,
  });
  app.useGlobalGuards(new AuthenticationGuard(reflector));
  // app.useGlobalGuards(new RefreshTokenGuard(reflector));
  app.setGlobalPrefix(END_POINTS.BASE);
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  app.use(cookieParser());
  app.useGlobalFilters(new HttpExceptionFilter());
  InitFirebase();
  SwaggerModule.setup('docs', app, document);
  await app.listen(port || 8080);
  console.log(`Server running on http://localhost:${port || 8080}/docs`);
}
bootstrap();
