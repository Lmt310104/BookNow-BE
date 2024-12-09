import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { WebhookController } from './webhook.controller';
import { WebhookService } from './webhook.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [PrismaModule, ConfigModule],
  controllers: [WebhookController],
  providers: [WebhookService],
})
export class WebhookModule {}
