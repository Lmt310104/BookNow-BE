import { Module } from '@nestjs/common';
import { OrderService } from './orders.service';
import { OrdersController } from './orders.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  providers: [OrderService],
  controllers: [OrdersController],
  imports: [PrismaModule, ConfigModule],
  exports: [OrderService],
})
export class OrdersModule {}
