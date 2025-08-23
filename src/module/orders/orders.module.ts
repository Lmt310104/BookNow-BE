import { Module } from '@nestjs/common';
import { OrderService } from './orders.service';
import { OrdersController } from './orders.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { EmailModule } from '../email/email.module';
import { GeminiModule } from '../gemini/gemini.module';
import { OrderImportExportService } from './orders-import-export.service';
import { RecommendationService } from '@module/recommendation/recommendation.service';
import { RecombeeAIProvider } from 'src/common/providers/recombeeAI.provider';
import { RecommendationModule } from '@module/recommendation/recommendation.module';

@Module({
  imports: [
    PrismaModule,
    ConfigModule,
    GeminiModule,
    EmailModule,
    RecommendationModule,
  ],
  providers: [
    OrderService,
    OrderImportExportService,
    RecommendationService,
    RecombeeAIProvider,
  ],
  controllers: [OrdersController],
  exports: [OrderService],
})
export class OrdersModule {}
