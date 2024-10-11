import { Module } from '@nestjs/common';
import { CartController } from './cart.controller';
import { CartsService } from './carts.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  providers: [CartsService],
  controllers: [CartController],
  imports: [PrismaModule],
  exports: [CartsService],
})
export class CartsModule {}
