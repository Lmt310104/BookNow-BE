import { Module } from '@nestjs/common';
import { RecombeeAIProvider } from 'src/common/providers/recombeeAI.provider';
import { RecommendationController } from './recommendation.controller';
import { RecommendationService } from './recommendation.service';
import { PrismaModule } from '@module/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [RecommendationController],
  providers: [RecombeeAIProvider, RecommendationService],
})
export class RecommendationModule {}
