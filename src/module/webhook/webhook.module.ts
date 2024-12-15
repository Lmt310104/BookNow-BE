import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { WebhookController } from './webhook.controller';
import { WebhookService } from './webhook.service';
import { ConfigModule } from '@nestjs/config';
import { GeminiModule } from '../gemini/gemini.module';

@Module({
  imports: [PrismaModule, ConfigModule, GeminiModule],
  controllers: [WebhookController],
  providers: [WebhookService],
})
export class WebhookModule {}
