import { Module } from '@nestjs/common';
import { CartItemsController } from './cart-items.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { CartItemsService } from './cart-items.service';

@Module({
  providers: [CartItemsService],
  controllers: [CartItemsController],
  imports: [PrismaModule],
})
export class CartItemsModule {}
