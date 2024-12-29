import { Module } from '@nestjs/common';
import { CartController } from './cart.controller';
import { CartsService } from './carts.service';
import { PrismaModule } from '../prisma/prisma.module';
import { OrdersModule } from '../orders/orders.module';
import { OrderService } from '../orders/orders.service';
import { EmailModule } from '../email/email.module';
import { GeminiModule } from '../gemini/gemini.module';

@Module({
  providers: [CartsService, OrderService],
  controllers: [CartController],
  imports: [PrismaModule, EmailModule, OrdersModule, GeminiModule],
  exports: [CartsService],
})
export class CartsModule {}
