import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { BooksController } from './books.controller';
import { BooksService } from './books.service';
import { AuthorsModule } from '../authors/authors.module';
import { CategoriesModule } from '../categories/categories.module';
import { RecommendationModule } from '@module/recommendation/recommendation.module';
import { RecommendationService } from '@module/recommendation/recommendation.service';
import { RecombeeAIProvider } from 'src/common/providers/recombeeAI.provider';

@Module({
  imports: [
    PrismaModule,
    AuthorsModule,
    CategoriesModule,
    RecommendationModule,
  ],
  providers: [BooksService, RecommendationService, RecombeeAIProvider],
  controllers: [BooksController],
  exports: [BooksService],
})
export class BooksModule {}
