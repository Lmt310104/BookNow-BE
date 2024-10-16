import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { BooksController } from './books.controller';
import { BooksService } from './books.service';
import { AuthorsModule } from '../authors/authors.module';
import { CategoriesModule } from '../categories/categories.module';

@Module({
  imports: [PrismaModule, AuthorsModule, CategoriesModule],
  providers: [BooksService],
  controllers: [BooksController],
  exports: [BooksService],
})
export class BooksModule {}
