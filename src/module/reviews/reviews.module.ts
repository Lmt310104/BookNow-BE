import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import { GeminiModule } from '../gemini/gemini.module';

@Module({
  imports: [PrismaModule, GeminiModule],
  controllers: [ReviewsController],
  providers: [ReviewsService],
})
export class ReviewsModule {}
