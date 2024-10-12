import { Module } from '@nestjs/common';
import { OrderService } from './orders.service';
import { OrdersController } from './orders.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  providers: [OrderService],
  controllers: [OrdersController],
  imports: [PrismaModule],
  exports: [OrderService],
})
export class OrdersModule {}
