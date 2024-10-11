import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookDto } from './dto/create-book.dto';
import { Books } from '@prisma/client';
import { BookQuery } from './query/book.query';
import { UpdateBookDto } from './dto/update-book.dto';

@Injectable()
export class BooksService {
  constructor(private readonly prismaService: PrismaService) {}

  async getAllBooks(bookQuery: BookQuery): Promise<Books[]> {
    const books = await this.prismaService.books.findMany({
      where: {
        title: {
          contains: bookQuery.title,
        },
        Category: {
          name: {
            contains: bookQuery.category,
          },
        },
        author: {
          name: {
            contains: bookQuery.author,
          },
        },
        status: bookQuery.status,
      },
      include: {
        Category: true,
        author: true,
      },
      orderBy: {
        [bookQuery.sortBy || 'created_at']: bookQuery.order || 'desc',
      },
      skip: bookQuery.skip,
      take: bookQuery.take,
    });
    return books;
  }
  async createBook(body: CreateBookDto) {
    const {
      title,
      authorId,
      categoryId,
      entryPrice,
      price,
      stockQuantity,
      description,
      images,
      status,
    } = body;
    const author = await this.prismaService.authors.findFirst({
      where: { id: authorId },
    });
    if (!author) {
      throw new BadRequestException('Author not found');
    }
    const category = await this.prismaService.category.findFirst({
      where: { id: categoryId },
    });
    if (!category) {
      throw new BadRequestException('Category not found');
    }
    const newBook = await this.prismaService.books.create({
      data: {
        title: title,
        author: { connect: { id: authorId } },
        Category: { connect: { id: categoryId } },
        entry_price: entryPrice,
        price,
        rating: 5,
        stock_quantity: stockQuantity,
        description,
        image_url: images,
        status: status,
      },
    });
    return newBook;
  }
  async updateBook(id, body: UpdateBookDto) {
    const existingBook = await this.prismaService.books.findFirst({
      where: { id: id },
    });
    if (!existingBook) {
      throw new BadRequestException('Book not found');
    }
    const updatedBook = await this.prismaService.books.update({
      where: { id: id },
      data: body,
    });
    return updatedBook;
  }
  async getBookDetailsById(id: string) {
    const book = await this.prismaService.books.findFirst({
      where: { id },
    });
    if (!book) {
      throw new BadRequestException('Book not found');
    }
    return book;
  }
}
