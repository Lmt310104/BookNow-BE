import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookDto } from './dto/create-book.dto';
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

  async getAllBooks(bookQuery: BookQuery) {
    const condition1 =
      bookQuery.search?.replace(/\s+/g, '&').trim() ??
      bookQuery.title?.replace(/\s+/g, '&').trim();
    const books = await this.prismaService.books.findMany({
      where: {
        ...(condition1 !== undefined && {
          OR: [
            {
              title: {
                search: condition1,
                mode: 'insensitive',
              },
            },
            {
              title: {
                contains: bookQuery.search,
                mode: 'insensitive',
              },
            },
            {
              description: {
                search: condition1,
                mode: 'insensitive',
              },
            },
            {
              description: {
                contains: bookQuery.search,
                mode: 'insensitive',
              },
            },
            {
              author: {
                search: condition1,
                mode: 'insensitive',
              },
            },
            {
              author: {
                contains: bookQuery.search,
                mode: 'insensitive',
              },
            },
            {
              Category: {
                name: {
                  contains: bookQuery.search,
                  mode: 'insensitive',
                },
              },
            },
            {
              Category: {
                name: {
                  search: condition1,
                  mode: 'insensitive',
                },
              },
            },
            {
              unaccent: {
                search: condition1,
                mode: 'insensitive',
              },
            },
          ],
        }),
        ...(bookQuery.status ? { status: bookQuery.status } : {}),
        ...(bookQuery.min_price && { price: { gte: bookQuery.min_price } }),
        ...(bookQuery.max_price && { price: { lte: bookQuery.max_price } }),
        ...(bookQuery.min_star && { avg_stars: { gte: bookQuery.min_star } }),
        ...(bookQuery.max_star && { avg_stars: { lte: bookQuery.max_star } }),
        ...(bookQuery.categoryId && {
          Category: { id: bookQuery.categoryId },
        }),
      },
      include: {
        Category: true,
      },
      orderBy: bookQuery.search
        ? {
            _relevance: {
              fields: ['title', 'description', 'author'],
              search: condition1,
              sort: 'desc',
            },
          }
        : { [bookQuery.sortBy]: bookQuery.order },
      skip: bookQuery.skip,
      take: bookQuery.take,
    });
    const itemCount = await this.prismaService.books.count({
      where: {
        ...(condition1 !== undefined && {
          OR: [
            {
              title: {
                search: condition1,
                mode: 'insensitive',
              },
            },
            {
              title: {
                contains: bookQuery.search,
                mode: 'insensitive',
              },
            },
            {
              description: {
                search: condition1,
                mode: 'insensitive',
              },
            },
            {
              description: {
                contains: bookQuery.search,
                mode: 'insensitive',
              },
            },
            {
              author: {
                search: condition1,
                mode: 'insensitive',
              },
            },
            {
              author: {
                contains: bookQuery.search,
                mode: 'insensitive',
              },
            },
            {
              Category: {
                name: {
                  contains: bookQuery.search,
                  mode: 'insensitive',
                },
              },
            },
            {
              Category: {
                name: {
                  search: condition1,
                  mode: 'insensitive',
                },
              },
            },
            {
              unaccent: {
                search: condition1,
                mode: 'insensitive',
              },
            },
          ],
        }),
        ...(bookQuery.status ? { status: bookQuery.status } : {}),
        ...(bookQuery.min_price && { price: { gte: bookQuery.min_price } }),
        ...(bookQuery.max_price && { price: { lte: bookQuery.max_price } }),
        ...(bookQuery.min_star && { avg_stars: { gte: bookQuery.min_star } }),
        ...(bookQuery.max_star && { avg_stars: { lte: bookQuery.max_star } }),
      },
    });
    return { books, itemCount };
  }
  async createBook(body: CreateBookDto, images?: Array<Express.Multer.File>) {
    const {
      title,
      categoryId,
      entryPrice,
      price,
      stockQuantity,
      description,
      supplierId,
    } = body;
    const category = await this.prismaService.category.findFirst({
      where: { id: categoryId },
    });
    if (!category) {
      throw new BadRequestException('Category not found');
    }
    const supplier = await this.prismaService.supplier.findFirst({
      where: { id: supplierId },
    });
    if (!supplier) {
      throw new BadRequestException('Supplier not found');
    }
    let imageUrls = [];
    try {
      if (images.length > 0) {
        const uploadImagesData = await uploadFilesFromFirebase(
          images,
          EUploadFolder.book,
        );
        if (!uploadImagesData.success) {
          throw new Error('Failed to upload images!');
        }
        imageUrls = uploadImagesData.urls;
      }
      let authorName = '';
      for (let i = 0; i < body.authors.length; i++) {
        const author = await this.prismaService.authors.findFirst({
          where: { id: body.authors[i] },
        });
        if (!author) {
          throw new BadRequestException('Author not found');
        }
        authorName += author.name + ' ';
      }
      const newBook = await this.prismaService.books.create({
        data: {
          title: title,
          author: authorName,
          Category: { connect: { id: categoryId } },
          Supplier: { connect: { id: supplierId } },
          entry_price: entryPrice,
          price,
          stock_quantity: parseInt(stockQuantity, 10),
          description,
          image_url: imageUrls,
        },
      });
      for (let i = 0; i < body.authors.length; i++) {
        await this.prismaService.bookAuthor.create({
          data: {
            book_id: newBook.id,
            author_id: body.authors[i],
          },
        });
      }
      const book = await this.prismaService.books.findFirst({
        where: { id: newBook.id },
        include: {
          Category: true,
          BookAuthor: {
            select: {
              author: true,
            },
          },
        },
      });
      return book;
    } catch (error) {
      console.log('Error:', error.message);
      if (images.length && !imageUrls.length)
        await deleteFilesFromFirebase(imageUrls);
      throw new BadRequestException({
        messaging: error.message,
      });
    }
  }
  async updateBook(
    id: string,
    dto: UpdateBookDto,
    images: Array<Express.Multer.File>,
  ) {
    const existingBook = await this.prismaService.books.findFirst({
      where: { id: id },
    });
    if (!existingBook) {
      throw new BadRequestException('Book not found');
    }
    let imageUrls = [];
    try {
      if (images.length > 0) {
        const uploadImagesData = await uploadFilesFromFirebase(
          images,
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
            image_url: imageUrls.length
              ? [...(dto.image_url ? dto.image_url : []), ...imageUrls]
              : existingBook.image_url,
            category_id: dto.categoryId ?? existingBook.category_id,
            price: dto?.price ?? existingBook.price,
            entry_price: dto?.entryPrice ?? existingBook.entry_price,
          },
        });
        return updatedBook;
      });
    } catch (error) {
      console.log('Error:', error.message);
      if (imageUrls.length && !imageUrls.length)
        await deleteFilesFromFirebase(imageUrls);
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
    const itemCount = await this.prismaService.books.count({
      where: {
        price: {
          gte: dto.minPrice,
          lte: dto.maxPrice,
        },
      },
    });
    return { books, itemCount };
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
    const itemCount = await this.prismaService.books.count({
      where: {
        avg_stars: {
          gte: dto.minRating,
          lte: dto.maxRating,
        },
      },
    });
    return { books, itemCount };
  }
  async searchBook(query: string, bookQuery: BookQuery) {
    const books = await this.prismaService.books.findMany({
      where: {
        OR: [
          {
            title: {
              contains: query,
              mode: 'insensitive',
            },
          },
          {
            author: {
              contains: query,
              mode: 'insensitive',
            },
          },
        ],
        ...(bookQuery.status && { status: bookQuery.status }),
      },
      take: bookQuery.take,
      skip: bookQuery.skip,
      orderBy: { [bookQuery.sortBy]: bookQuery.order },
    });
    const itemCount = await this.prismaService.books.count({
      where: {
        OR: [
          {
            title: {
              contains: query,
              mode: 'insensitive',
            },
          },
          {
            author: {
              contains: query,
              mode: 'insensitive',
            },
          },
        ],
      },
    });
    return { books, itemCount };
  }
  async searchByCategory(categoryId: string, bookQuery: BookQuery) {
    const books = await this.prismaService.books.findMany({
      where: {
        Category: {
          id: categoryId,
        },
        ...(bookQuery.status && { status: bookQuery.status }),
      },
      take: bookQuery.take,
      skip: bookQuery.skip,
      orderBy: { [bookQuery.sortBy]: bookQuery.order },
    });
    const itemCount = await this.prismaService.books.count({
      where: {
        Category: {
          id: categoryId,
        },
      },
    });
    return { books, itemCount };
  }
  async activeBook(id: string) {
    const existingBook = await this.prismaService.books.update({
      where: { id },
      data: { status: 'ACTIVE' },
    });
    if (!existingBook) {
      throw new BadRequestException('Book not found');
    }
    return existingBook;
  }
  async inactiveBook(id: string) {
    const existingBook = await this.prismaService.books.update({
      where: { id },
      data: { status: 'INACTIVE' },
    });
    if (!existingBook) {
      throw new BadRequestException('Book not found');
    }
    return existingBook;
  }
  async newSearchBook(bookQuery: BookQuery) {
    try {
      const books = await this.prismaService.books.findMany({
        where: {
          OR: [
            {
              title: {
                search: bookQuery.search,
                mode: 'insensitive',
              },
            },
            {
              description: {
                search: bookQuery.search,
                mode: 'insensitive',
              },
            },
            {
              author: {
                search: bookQuery.search,
                mode: 'insensitive',
              },
            },
            {
              Category: {
                name: {
                  search: bookQuery.search,
                  mode: 'insensitive',
                },
              },
            },
          ],
        },
        orderBy: {
          _relevance: {
            fields: ['title'],
            search: bookQuery.search,
            sort: 'desc',
          },
        },
        skip: bookQuery.skip,
        take: bookQuery.take,
      });
      const itemCount = await this.prismaService.books.count({
        where: {
          OR: [
            {
              title: {
                search: bookQuery.search,
              },
            },
            {
              description: {
                search: bookQuery.search,
              },
            },
            {
              author: {
                search: bookQuery.search,
              },
            },
            {
              Category: {
                name: {
                  search: bookQuery.search,
                },
              },
            },
          ],
        },
        orderBy: {
          _relevance: {
            fields: ['title'],
            search: bookQuery.search,
            sort: 'desc',
          },
        },
      });
      return { books, itemCount };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
