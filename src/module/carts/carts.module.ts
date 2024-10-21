import { Module } from '@nestjs/common';
import { CartController } from './cart.controller';
import { CartsService } from './carts.service';
import { PrismaModule } from '../prisma/prisma.module';
import { OrdersModule } from '../orders/orders.module';
import { OrderService } from '../orders/orders.service';

@Module({
  providers: [CartsService, OrderService],
  controllers: [CartController],
  imports: [PrismaModule, OrdersModule],
  exports: [CartsService],
})
export class CartsModule {}
