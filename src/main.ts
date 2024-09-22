import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule } from '@nestjs/swagger';
import documentation from './config/documentation';
import { END_POINTS } from './utils/constants';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get<string>('port');
  const document = SwaggerModule.createDocument(app, documentation, {
    ignoreGlobalPrefix: true,
  });
  app.setGlobalPrefix(END_POINTS.BASE);

  SwaggerModule.setup('docs', app, document);
  await app.listen(port || 3000);
  console.log(`Server running on http://localhost:${port || 3000}/docs`);
}
bootstrap();
