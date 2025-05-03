import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { PromotionService } from './promotion.service';
import { PromotionController } from './promotion.controller';
import { PromotionSchedulerService } from './promotion-scheduler.service';

@Module({
  controllers: [PromotionController],
  imports: [PrismaModule],
  providers: [PromotionService, PromotionSchedulerService],
})
export class PromotionModule {}
