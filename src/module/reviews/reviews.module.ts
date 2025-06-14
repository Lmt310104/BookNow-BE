import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import { GeminiModule } from '../gemini/gemini.module';
import { RecommendationService } from '@module/recommendation/recommendation.service';
import { RecombeeAIProvider } from 'src/common/providers/recombeeAI.provider';

@Module({
  imports: [PrismaModule, GeminiModule],
  controllers: [ReviewsController],
  providers: [ReviewsService, RecommendationService, RecombeeAIProvider],
})
export class ReviewsModule {}
