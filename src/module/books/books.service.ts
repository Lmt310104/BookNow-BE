import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookDto } from './dto/create-book.dto';
import { Books } from '@prisma/client';
import { BookQuery } from './query/book.query';
import { UpdateBookDto } from './dto/update-book.dto';
import { uploadFilesFromFirebase } from 'src/services/files/upload';
import { EUploadFolder } from 'src/utils/constants';
import { deleteFilesFromFirebase } from 'src/services/files/delete';
import { PriceFilterDto } from './dto/filter-by-price.dto';
import { RatingFilterDto } from './dto/filter-by-rating.dto';

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
        status: bookQuery.status,
      },
      include: {
        Category: true,
      },
      orderBy: {
        [bookQuery.sortBy || 'created_at']: bookQuery.order || 'desc',
      },
      skip: bookQuery.skip,
      take: bookQuery.take,
    });
    return books;
  }
  async createBook(body: CreateBookDto, image?: Express.Multer.File) {
    const {
      title,
      author,
      categoryId,
      entryPrice,
      price,
      stockQuantity,
      description,
    } = body;
    const category = await this.prismaService.category.findFirst({
      where: { id: categoryId },
    });
    if (!category) {
      throw new BadRequestException('Category not found');
    }
    let imageUrls = [];
    try {
      if (image && image.buffer.byteLength > 0) {
        const uploadImagesData = await uploadFilesFromFirebase(
          [image],
          EUploadFolder.book,
        );
        if (!uploadImagesData.success) {
          throw new Error('Failed to upload images!');
        }
        imageUrls = uploadImagesData.urls;
      }
      const newBook = await this.prismaService.books.create({
        data: {
          title: title,
          author: author,
          Category: { connect: { id: categoryId } },
          entry_price: entryPrice,
          price,
          stock_quantity: parseInt(stockQuantity, 10),
          description,
          image_url: imageUrls,
        },
      });
      return newBook;
    } catch (error) {
      console.log('Error:', error.message);
      if (image && !imageUrls.length) await deleteFilesFromFirebase(imageUrls);
      throw new BadRequestException({
        messaging: error.message,
      });
    }
  }
  async updateBook(id: string, dto: UpdateBookDto, image: Express.Multer.File) {
    const existingBook = await this.prismaService.books.findFirst({
      where: { id: id },
    });
    if (!existingBook) {
      throw new BadRequestException('Book not found');
    }
    let imageUrls = [];
    try {
      if (image && image.buffer.byteLength > 0) {
        const uploadImagesData = await uploadFilesFromFirebase(
          [image],
          EUploadFolder.book,
        );
        if (!uploadImagesData.success) {
          throw new Error('Failed to upload images!');
        }
        imageUrls = uploadImagesData.urls;
      }
      return await this.prismaService.$transaction(async (tx) => {
        const updatedBook = await tx.books.update({
          where: { id },
          data: {
            title: dto.title,
            description: dto.description,
            image_url: imageUrls.length ? imageUrls[0] : existingBook.image_url,
            price: dto?.price ?? existingBook.price,
          },
        });
        return updatedBook;
      });
    } catch (error) {
      console.log('Error:', error.message);
      if (image && !imageUrls.length) await deleteFilesFromFirebase(imageUrls);
      throw new BadRequestException({
        messaging: error.message,
      });
    }
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
  async searchByPrice(dto: PriceFilterDto, query: BookQuery) {
    const books = await this.prismaService.books.findMany({
      where: {
        price: {
          gte: dto.minPrice,
          lte: dto.maxPrice,
        },
      },
      take: query.take,
      skip: query.skip,
      orderBy: { [query.sortBy]: query.order },
    });
    return books;
  }
  async searchByRating(dto: RatingFilterDto, query: BookQuery) {
    const books = await this.prismaService.books.findMany({
      where: {
        avg_stars: {
          gte: dto.minRating,
          lte: dto.maxRating,
        },
      },
      take: query.take,
      skip: query.skip,
      orderBy: { [query.sortBy]: query.order },
    });
    return books;
  }
}
