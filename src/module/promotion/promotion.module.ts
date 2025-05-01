import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { PromotionService } from './promotion.service';
import { PromotionController } from './promotion.controller';

@Module({
  controllers: [PromotionController],
  imports: [PrismaModule],
  providers: [PromotionService],
})
export class PromotionModule {}
