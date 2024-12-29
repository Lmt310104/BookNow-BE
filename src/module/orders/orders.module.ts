import { Module } from '@nestjs/common';
import { OrderService } from './orders.service';
import { OrdersController } from './orders.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { EmailModule } from '../email/email.module';
import { GeminiModule } from '../gemini/gemini.module';

@Module({
  providers: [OrderService],
  controllers: [OrdersController],
  imports: [PrismaModule, ConfigModule, EmailModule, GeminiModule],
  exports: [OrderService],
})
export class OrdersModule {}
