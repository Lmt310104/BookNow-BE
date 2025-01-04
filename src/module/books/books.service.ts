/* eslint-disable prettier/prettier */
import { BadRequestException, HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookDto } from './dto/create-book.dto';
import { BookQuery } from './query/book.query';
import { UpdateBookDto } from './dto/update-book.dto';
import { uploadFilesFromFirebase } from 'src/services/files/upload';
import { EUploadFolder } from 'src/utils/constants';
import { deleteFilesFromFirebase } from 'src/services/files/delete';
import { PriceFilterDto } from './dto/filter-by-price.dto';
import { RatingFilterDto } from './dto/filter-by-rating.dto';
import * as ExcelJS from 'exceljs';
import { Buffer } from 'buffer';
import { TUserSession } from 'src/common/decorators/user-session.decorator';

@Injectable()
export class BooksService {
  constructor(private readonly prismaService: PrismaService) {}

  async getAllBooks(bookQuery: BookQuery) {
    const AND = [
      {
        price: {
          ...(bookQuery.min_price && { gte: bookQuery.min_price }),
          ...(bookQuery.max_price && { lte: bookQuery.max_price }),
        },
      },
      {
        avg_stars: {
          ...(bookQuery.min_star && { gte: bookQuery.min_star }),
          ...(bookQuery.max_star && { lte: bookQuery.max_star }),
        },
      },
      ...(bookQuery.categoryId
        ? [
            {
              Category: { id: bookQuery.categoryId },
            },
          ]
        : []),
    ].filter(
      (condition) =>
        Object.keys(condition).length > 0 &&
        Object.keys(Object.values(condition)[0]).length > 0,
    );

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
            {
              unaccent: {
                contains: condition1,
                mode: 'insensitive',
              },
            },
          ],
        }),
        ...(bookQuery.status ? { status: bookQuery.status } : {}),
        AND: AND,
      },
      include: {
        Category: true,
      },
      orderBy: [
        condition1 !== undefined
        ? {
            _relevance: {
              fields: ['title', 'description', 'author'],
              search: condition1,
              sort: 'desc',
            },
          }
        : {}
        ,{ [bookQuery.sortBy]: bookQuery.order }

      ],
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
            {
              unaccent: {
                contains: condition1,
                mode: 'insensitive',
              },
            },
          ],
        }),
        ...(bookQuery.status ? { status: bookQuery.status } : {}),
        AND: AND,
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
      sku,
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
    const existingBook = await this.prismaService.books.findUnique({
      where: { sku },
    });
    if (existingBook) {
      throw new BadRequestException('Book already exists with this SKU');
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
          where: { id: body.authors[i].toString() },
        });
        authorName +=  author ? author.name + ' ': '';
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
          sku,
        },
      });
      for (let i = 0; i < body.authors.length; i++) {
        const author = await this.prismaService.authors.findFirst({
          where: { id: body.authors[i].toString() },
        });
        if (author) {
          await this.prismaService.bookAuthor.create({
            data: {
              book_id: newBook.id,
              author_id: body.authors[i],
            },
          });
        }
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
      let authorName = '';
      if (dto.authors) {
        for (let i = 0; i < dto.authors.length; i++) {
          console.log('dto.authors[i].toString()', dto.authors[i].toString());
          const author = await this.prismaService.authors.findUnique({
            where: { id: dto.authors[i].toString() },
          });
          authorName += author ? author.name + ' ' : '';
        }
      }
      return await this.prismaService.$transaction(async (tx) => {
        const updatedBook = await tx.books.update({
          where: { id },
          data: {
            title: dto.title,
            description: dto.description,
            author: authorName !== '' ? authorName : existingBook.author,
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
      include: {
        BookAuthor: {
          include: {
            author: true,
          },
        },
      },
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
  async generateExcel(bookIds: string[]): Promise<Buffer> {
    // Fetch data from database
    const books = await this.prismaService.books.findMany({
      where: {
        id: {
          in: bookIds,
        },
      },
      include: {
        Category: true,
      },
    });

    // Create workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Cập nhật tồn kho');

    // Define columns
    worksheet.columns = [
      {
        header: 'Tên phân loại sản phẩm ',
        key: 'productCategory',
        width: 20,
      },
      {
        header: 'Tên sản phẩm kho',
        key: 'productName',
        width: 40,
      },
      {
        header: 'ID sản phẩm',
        key: 'productId',
        width: 30,
      },
      {
        header: 'SKU ID sản phẩm kho',
        key: 'skuId',
        width: 30,
      },
      {
        header: 'Số lượng sản phẩm tồn kho',
        key: 'stockQuantity',
        width: 30,
      },
      {
        header:
          'Giá nhập ban đầu\n(Giá nhập ban đầu là giá bạn trả cho nhà cung cấp để nhập hàng)\nGiá nhập sẽ được dùng để tính chi phí bán hàng ở tính năng Kế toán\n(Nhập nếu cần)',
        key: 'initialImportPrice',
        width: 40,
      },
      {
        header:
          'Giá bán sản phẩm (Giá bán sẽ được dùng để tính doanh thu trên từng đơn đặt hàng cho các đơn hàng)',
        key: 'initialSellPrice',
        width: 40,
      },
      {
        header: 'Thời gian xuất file',
        key: 'syncTime',
        width: 60,
      },
    ];

    worksheet.spliceRows(1, 0, []);

    this.setupMergedCells(worksheet);

    this.applyHeaderStyles(worksheet);

    this.addDataRows(worksheet, books);

    this.applyColumnProtection(worksheet);

    this.applyDataStyles(worksheet);

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
  private setupMergedCells(worksheet: ExcelJS.Worksheet) {
    // Merge cells for instructions
    worksheet.mergeCells('A1:D1');
    worksheet.mergeCells('E1:G1');

    // Set merged cells content and alignment
    const nonEditableCells = ['A1', 'H1'];
    const editableCell = 'E1';

    worksheet.getCell('A1').value = 'Vui lòng không chỉnh sửa';
    worksheet.getCell('E1').value = 'Có thể chỉnh sửa';
    worksheet.getCell('H1').value = 'Không chỉnh sửa';

    [editableCell, ...nonEditableCells].forEach((cell) => {
      worksheet.getCell(cell).alignment = {
        horizontal: 'center',
        vertical: 'middle',
      };
    });
  }
  private applyHeaderStyles(worksheet: ExcelJS.Worksheet) {
    const headerRow = worksheet.getRow(1);
    headerRow.height = 25;

    headerRow.eachCell((cell, colNumber) => {
      if (colNumber === 0 || colNumber === worksheet.columns.length) {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFEBE7' },
        };
        cell.font = {
          bold: true,
          size: 16,
          color: { argb: 'FC2D33' },
        };
      } else {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'EAF9EF' },
        };
        cell.font = {
          bold: true,
          size: 16,
          color: { argb: '55CC77' },
        };
      }
      cell.alignment = {
        vertical: 'middle',
        horizontal: 'center',
        wrapText: true,
      };
    });
    const mergedCell1 = worksheet.getCell('A1');
    mergedCell1.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFEBE7' },
    };
    mergedCell1.font = {
      bold: true,
      size: 16,
      color: { argb: 'FC2D33' },
    };
    mergedCell1.alignment = {
      vertical: 'middle',
      horizontal: 'center',
      wrapText: true,
    };
    const headerRow2 = worksheet.getRow(2);
    headerRow2.height = 100;
    worksheet.getRow(2).eachCell((cell) => {
      cell.font = { bold: true };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'F2F2F2' },
      };
    });

    worksheet.getCell('E2').value = {
      richText: [
        {
          text: 'Số lượng sản phẩm còn tổn trong kho\n',
          font: { bold: false, size: 13 },
        }, // Dòng đầu tiên in đậm
        {
          text: '(Điều chỉnh nếu cần thiết)\n',
          font: { italic: true, size: 10 },
        },
        {
          text: '(Nhập nếu cần)',
          font: { color: { argb: 'FF0000' }, italic: true },
        },
      ],
    };
    worksheet.getCell('F2').value = {
      richText: [
        { text: 'Giá nhập ban đầu\n', font: { bold: false, size: 13 } },
        {
          text: '(Giá nhập ban đầu là giá bạn trả cho nhà cung cấp để nhập hàng)\n',
          font: { italic: true, size: 10 },
        },
        {
          text: 'Giá nhập sẽ được dùng để tính chi phí bán hàng ở tính năng Kế toán\n',
          font: { size: 10 },
        },
        {
          text: '(Nhập nếu cần)',
          font: { color: { argb: 'FF0000' }, italic: true },
        },
      ],
    };
    worksheet.getCell('G2').value = {
      richText: [
        { text: 'Giá bán của sản phẩm\n', font: { bold: false, size: 13 } },
        {
          text: '(Giá bán ban đầu là giá bán của sản phẩm khi chưa có các chi phí khác)\n',
          font: { italic: true, size: 10 },
        },
        {
          text: 'Giá bán sẽ được dùng để tính doanh thu trên từng đơn đặt hàng cho các đơn hàng\n',
          font: { size: 10 },
        },
        {
          text: '(Nhập nếu cần)',
          font: { color: { argb: 'FF0000' }, italic: true },
        },
      ],
    };
  }
  private addDataRows(worksheet: ExcelJS.Worksheet, books: any[]) {
    const currentDate = new Date().toLocaleString('vi-VN');

    books.forEach((book, index) => {
      worksheet.addRow({
        productCategory: book.Category.name,
        productName: book.title,
        productId: book.id,
        skuId: book.sku,
        stockQuantity: book.stock_quantity || 0,
        initialImportPrice: Number(book.entry_price) || 0,
        initialSellPrice: Number(book.price) || 0,
        syncTime: currentDate,
      });
    });
  }
  private applyColumnProtection(worksheet: ExcelJS.Worksheet) {
    // Protect specific columns from editing
    worksheet.protect('your-password-here', {
      selectLockedCells: true,
      selectUnlockedCells: true,
      formatCells: true,
      formatColumns: true,
      formatRows: true,
      insertColumns: false,
      insertRows: false,
      insertHyperlinks: false,
      deleteColumns: false,
      deleteRows: false,
      sort: false,
      autoFilter: false,
      pivotTables: false,
    });

    // Lock non-editable columns
    ['A', 'B', 'C', 'D', 'H'].forEach((col) => {
      worksheet.getColumn(col).eachCell({ includeEmpty: false }, (cell) => {
        cell.protection = { locked: true };
      });
    });

    // Unlock editable columns
    ['E', 'F', 'G'].forEach((col) => {
      worksheet.getColumn(col).eachCell({ includeEmpty: false }, (cell) => {
        cell.protection = { locked: false };
      });
    });
  }
  private applyDataStyles(worksheet: ExcelJS.Worksheet) {
    const rowCount = worksheet.rowCount;
    for (let rowNumber = 3; rowNumber <= rowCount; rowNumber++) {
      for (let colNumber = 1; colNumber <= 4; colNumber++) {
        const cell = worksheet.getCell(rowNumber, colNumber);
        cell.font = {
          color: { argb: '808080' },
        };
      }
      const cell = worksheet.getCell(rowNumber, 8);
      cell.font = {
        color: { argb: '808080' },
      };
    }
    for (let rowNumber = 3; rowNumber <= rowCount; rowNumber++) {
      for (let colNumber = 1; colNumber <= 4; colNumber++) {
        const cell = worksheet.getCell(rowNumber, colNumber);
        cell.font = {
          color: { argb: '808080' },
        };
      }
    }
    const totalRows = Math.max(worksheet.rowCount + 1000, 1000);
    for (let rowNumber = 3; rowNumber <= totalRows; rowNumber++) {
      for (let colNumber = 5; colNumber <= 7; colNumber++) {
        const cell = worksheet.getCell(rowNumber, colNumber);
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'EAF9EF' },
        };
      }
    }
  }
  async readInventoryExcel(buffer: Buffer) {
    try {
      if (!buffer) {
        throw new BadRequestException('File is empty');
      }
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer);
      const worksheet = workbook.getWorksheet(1);
      const data = [];
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber > 2) {
          for (let i = 1; i <= 8; i++) {
            if (!row.getCell(i).value) {
              throw new BadRequestException(
                `Missing value in row ${rowNumber}, column ${i}`,
              );
            }
            if(i === 5 && (isNaN(Number(row.getCell(i).value)) || Number(row.getCell(i).value)< 0)){
              throw new BadRequestException(
                `Invalid value in row ${rowNumber}, column ${i}`,
              );
            }
            if(i === 6 && (isNaN(Number(row.getCell(i).value)) || Number(row.getCell(i).value)< 0)){
              throw new BadRequestException(
                `Invalid value in row ${rowNumber}, column ${i}`,
              );
            }
            if (i === 7 && (isNaN(Number(row.getCell(i).value)) || Number(row.getCell(i).value)< 0)){
              throw new BadRequestException(
                `Invalid value in row ${rowNumber}, column ${i}`,
              );
            }
          }
          data.push({
            productCategory: row.getCell(1).value,
            productName: row.getCell(2).value,
            productId: row.getCell(3).value,
            skuId: row.getCell(4).value,
            stockQuantity: row.getCell(5).value,
            initialImportPrice: row.getCell(6).value,
            initialSellPrice: row.getCell(7).value,
            syncTime: row.getCell(8).value,
          });
        }
      });
      await Promise.all(
        data.map(async (item) => {
          const book = await this.prismaService.books.findFirst({
            where: { sku: item.skuId },
          });
          if (book) {
            await this.prismaService.books.update({
              where: { id: book.id },
              data: {
                stock_quantity: item.stockQuantity,
                entry_price: item.initialImportPrice,
                price: item.initialSellPrice,
              },
            });
          }
        }),
      );
      return data;
    } catch (error) {
      throw new HttpException(error.message, 400);
    }
  }
  async getRecommendBooksByCategory(query: BookQuery, bookId: string) {
    try{
      const book = await this.prismaService.books.findFirst({
        where: { id: bookId },
      });
      const books = await this.prismaService.books.findMany({
        where: {
          Category: {
            id: book.category_id,
          },
          id: {
            not: book.id,
          },
        },
        take: query.take,
        skip: query.skip,
        orderBy: { [query.sortBy]: query.order },
      });
      const itemCount = await this.prismaService.books.count({
        where: {
          Category: {
            id: book.category_id,
          },
          id: {
            not: book.id,
          },
        },
      });
      return {books, itemCount};
    } 
    catch(error){
      throw new BadRequestException(error.message);
    }
  }
  async getAllBookByAuthor(query: BookQuery, bookId: string) {
    try {
      const bookAuthors = await this.prismaService.bookAuthor.findMany({
        where: {
          book_id: bookId,
        },
      });
      const authorsId = bookAuthors.map((author) => author.author_id);
      const authors = await this.prismaService.authors.findMany({
        where: {
          id: {
            in: authorsId,
          },
        },
      });
      console.log(authors)
      

      const searchCondition = authors
      .map((author) => author.name.trim().split(/\s+/).filter(Boolean).join('&')) 
      .join(' | ');
    
     console.log('searchCondition', searchCondition);  
      const books = await this.prismaService.books.findMany({
        where: {
          OR: [
            {
              author : {
                search: searchCondition,
                mode: 'insensitive',
              }
            },
            {
              description: {
                search: searchCondition,
                mode: 'insensitive',
              }
            },
            {
              title: {
                search: searchCondition,
                mode: 'insensitive',
              }
            }
          ],
        },
        take: query.take,
        skip: query.skip,
        orderBy: {
          _relevance: {
            fields: ['author', 'description', 'title'],
            search: searchCondition,
            sort: 'desc',
          },
        },
      });
      
      const itemCount = await this.prismaService.books.count({
        where: {
          OR: [
            {
              author : {
                search: searchCondition,
                mode: 'insensitive',
              }
            },
            {
              description: {
                search: searchCondition,
                mode: 'insensitive',
              }
            },
            {
              title: {
                search: searchCondition,
                mode: 'insensitive',
              }
            }
          ],
        },
      });
      return { books, itemCount };
    }
    catch(error){
      console.log('Error:', error.message);
      throw new BadRequestException(error.message);
    }
  }
  async getRecommendBooksByCart(user: TUserSession, query: BookQuery) {
    try {
      const cart = await this.prismaService.carts.findFirst({
        where: {
          user_id: user.id,
        },
        include: {
          CartItems: {
            select:  {
              book_id: true,
            }
          },
        }
      });
      const bookAuthors = await this.prismaService.bookAuthor.findMany({
        where: {
          book_id: {
            in: cart.CartItems.map((book) => book.book_id),
          },
        },
      });
      const authorsId = bookAuthors.map((author) => author.author_id);
      const authors = await this.prismaService.authors.findMany({
        where: {
          id: {
            in: authorsId,
          },
        },
      });
      const searchCondition = authors
      .map((author) => author.name.trim().split(/\s+/).filter(Boolean).join('&')) 
      .join(' | '); 
      const books = await this.prismaService.books.findMany({
        where: {
          OR: [
            {
              author : {
                search: searchCondition,
                mode: 'insensitive',
              }
            },
            {
              description: {
                search: searchCondition,
                mode: 'insensitive',
              }
            },
            {
              title: {
                search: searchCondition,
                mode: 'insensitive',
              }
            }
          ],
        },
        take: query.take,
        skip: query.skip,
        orderBy: {
          _relevance: {
            fields: ['author', 'description', 'title'],
            search: searchCondition,
            sort: 'desc',
          },
        },
      });
      const itemCount = await this.prismaService.books.count({
        where: {
          OR: [
            {
              author : {
                search: searchCondition,
                mode: 'insensitive',
              }
            },
            {
              description: {
                search: searchCondition,
                mode: 'insensitive',
              }
            },
            {
              title: {
                search: searchCondition,
                mode: 'insensitive',
              }
            }
          ],
        },
      });
      return {books, itemCount};
    }
    catch(error){
      throw new BadRequestException(error.message);
    }
  }
}
