import { Module } from '@nestjs/common';
import { CartController } from './cart.controller';
import { CartsService } from './carts.service';
import { PrismaModule } from '../prisma/prisma.module';
import { OrdersModule } from '../orders/orders.module';
import { OrderService } from '../orders/orders.service';
import { EmailModule } from '../email/email.module';
import { GeminiModule } from '../gemini/gemini.module';
import { RecommendationModule } from '@module/recommendation/recommendation.module';
import { RecombeeAIProvider } from 'src/common/providers/recombeeAI.provider';
import { RecommendationService } from '@module/recommendation/recommendation.service';

@Module({
  providers: [
    CartsService,
    OrderService,
    RecommendationService,
    RecombeeAIProvider,
  ],
  controllers: [CartController],
  imports: [
    PrismaModule,
    EmailModule,
    OrdersModule,
    GeminiModule,
    RecommendationModule,
  ],
  exports: [CartsService],
})
export class CartsModule {}
