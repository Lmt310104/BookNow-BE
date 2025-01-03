import {
  Body,
  Controller,
  Get,
  Param,
  ParseFilePipeBuilder,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Res,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import {
  DOCUMENTATION,
  END_POINTS,
  FILE_TYPES_REGEX,
} from 'src/utils/constants';
import { CreateBookDto } from './dto/create-book.dto';
import { BooksService } from './books.service';
import { StandardResponse } from 'src/utils/response.dto';
import { Books } from '@prisma/client';
import HttpStatusCode from 'src/utils/HttpStatusCode';
import { PageResponseDto } from 'src/utils/page-response.dto';
import { PageResponseMetaDto } from 'src/utils/page-response-meta.dto';
import { PageOptionsDto } from 'src/utils/page-options-dto';
import { BookQuery } from './query/book.query';
import { UpdateBookDto } from './dto/update-book.dto';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { PriceFilterDto } from './dto/filter-by-price.dto';
import { RatingFilterDto } from './dto/filter-by-rating.dto';
import { Public } from 'src/common/decorators/public.decorator';
import { Response } from 'express';
import {
  TUserSession,
  UserSession,
} from 'src/common/decorators/user-session.decorator';

const {
  BOOKS: {
    BASE,
    GET_ALL,
    CREATE,
    UPDATE,
    GET_ONE,
    SEARCH,
    SEARCH_BY_PRICE,
    SEARCH_BY_RATING,
    SEARCH_BY_CATEGORY,
    ACTIVE,
    INACTIVE,
    NEW_SEARCH,
    EXPORT_EXCEL,
    IMPORT_EXCEL,
  },
} = END_POINTS;

@ApiTags(DOCUMENTATION.TAGS.BOOKS)
@Controller(BASE)
export class BooksController {
  constructor(private readonly bookService: BooksService) {}
  @ApiOperation({
    summary: 'Get all books',
    description: 'Allow admin/ customer',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number',
  })
  @ApiQuery({
    name: 'take',
    required: false,
    type: Number,
    description: 'Items per page',
  })
  @ApiQuery({
    name: 'title',
    required: false,
    type: String,
    description: 'Book title',
  })
  @ApiQuery({
    name: 'author',
    required: false,
    type: String,
    description: 'Book author',
  })
  @ApiQuery({
    name: 'category',
    required: false,
    type: String,
    description: 'Book category',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['INSTOCK', 'OUTOFSTOCK'],
    description: 'Book status',
  })
  @Get(GET_ALL)
  @Public()
  @UsePipes(new ValidationPipe({ transform: true }))
  async getAllBooks(
    @Query() bookQuery: BookQuery,
  ): Promise<PageResponseDto<Books>> {
    const { books, itemCount } = await this.bookService.getAllBooks(bookQuery);
    const pageOptionsDto = new PageOptionsDto(bookQuery);
    const meta = new PageResponseMetaDto({
      pageOptionsDto,
      itemCount: itemCount,
    });
    return new PageResponseDto(books, meta);
  }
  @ApiOperation({
    summary: 'Create a new book',
    description: 'Allow admin',
  })
  @Post(CREATE)
  @UseInterceptors(FilesInterceptor('images'))
  async createBook(
    @Body() body: CreateBookDto,
    @UploadedFiles(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: FILE_TYPES_REGEX,
        })
        .build({
          fileIsRequired: false,
        }),
    )
    images?: Array<Express.Multer.File>,
  ): Promise<StandardResponse<Books>> {
    const newBook: Books = await this.bookService.createBook(body, images);
    const message = 'Create book successfully';
    return new StandardResponse(newBook, message, HttpStatusCode.CREATED);
  }
  @ApiOperation({
    summary: 'Update a book',
    description: 'Allow admin',
  })
  @Patch(UPDATE)
  @UseInterceptors(FilesInterceptor('images_update'))
  async updateBook(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateBookDto,
    @UploadedFiles(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: FILE_TYPES_REGEX,
        })
        .build({
          fileIsRequired: false,
        }),
    )
    images?: Array<Express.Multer.File>,
  ): Promise<StandardResponse<Books>> {
    const updatedBook: Books = await this.bookService.updateBook(
      id,
      dto,
      images,
    );
    const message = 'Update book successfully';
    return new StandardResponse(updatedBook, message, HttpStatusCode.OK);
  }
  @ApiOperation({
    summary: 'Get a book by id',
    description: 'Allow admin/ customer',
  })
  @Public()
  @Get(GET_ONE)
  async getBookDetailsById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<StandardResponse<Books>> {
    const book: Books = await this.bookService.getBookDetailsById(id);
    const message = 'Get book successfully';
    return new StandardResponse(book, message, HttpStatusCode.OK);
  }
  @Get(SEARCH_BY_PRICE)
  async searchByPrice(@Body() dto: PriceFilterDto, @Query() query: BookQuery) {
    const { books, itemCount } = await this.bookService.searchByPrice(
      dto,
      query,
    );
    const meta = new PageResponseMetaDto({
      pageOptionsDto: query,
      itemCount: itemCount,
    });
    return new PageResponseDto(books, meta);
  }
  @Get(SEARCH_BY_RATING)
  async searchByRating(
    @Body() dto: RatingFilterDto,
    @Query() query: BookQuery,
  ) {
    const { books, itemCount } = await this.bookService.searchByRating(
      dto,
      query,
    );
    const meta = new PageResponseMetaDto({
      pageOptionsDto: query,
      itemCount: itemCount,
    });
    return new PageResponseDto(books, meta);
  }
  @Get(SEARCH)
  async searchBook(
    @Query() bookQuery: BookQuery,
    @Query('query') query?: string,
  ) {
    const { books, itemCount } = await this.bookService.searchBook(
      query,
      bookQuery,
    );
    const meta = new PageResponseMetaDto({
      pageOptionsDto: bookQuery,
      itemCount: itemCount,
    });
    return new PageResponseDto(books, meta);
  }
  @Get(SEARCH_BY_CATEGORY)
  async searchByCategory(
    @Param('categoryId', ParseUUIDPipe) categoryId: string,
    @Query() BookQuery: BookQuery,
  ) {
    const { books, itemCount } = await this.bookService.searchByCategory(
      categoryId,
      BookQuery,
    );
    const meta = new PageResponseMetaDto({
      pageOptionsDto: BookQuery,
      itemCount: itemCount,
    });
    return new PageResponseDto(books, meta);
  }
  @Post(ACTIVE)
  async enableBook(@Param('id', ParseUUIDPipe) id: string) {
    const book = await this.bookService.activeBook(id);
    return new StandardResponse(
      book,
      'Enable book successfully',
      HttpStatusCode.OK,
    );
  }
  @Post(INACTIVE)
  async disableBook(@Param('id', ParseUUIDPipe) id: string) {
    const book = await this.bookService.inactiveBook(id);
    return new StandardResponse(
      book,
      'Disable book successfully',
      HttpStatusCode.OK,
    );
  }
  @Public()
  @Get(NEW_SEARCH)
  async newSearch(@Query() bookQuery: BookQuery) {
    const { books, itemCount } =
      await this.bookService.newSearchBook(bookQuery);
    const meta = new PageResponseMetaDto({
      pageOptionsDto: bookQuery,
      itemCount: itemCount,
    });
    return new PageResponseDto(books, meta);
  }
  @Public()
  @Get(EXPORT_EXCEL)
  async exportExcel(@Res() res: Response, @Body() body: { books: string[] }) {
    const buffer = await this.bookService.generateExcel(body.books);
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');

    const fileName = `Cập nhật tồn kho ban đầu_${minutes}${hours}_${day}${month}${year}.xlsx`;
    res.setHeader(
      'Content-Disposition',
      `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}`,
    );

    res.type(
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.send(buffer);
  }

  @Post(IMPORT_EXCEL)
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    const data = await this.bookService.readInventoryExcel(file?.buffer);
    return { message: 'File processed successfully', data };
  }

  @Public()
  @Get('recommend-by-author/:bookId')
  async getRecommendBookByAuthor(
    @Query() query: BookQuery,
    @Param('bookId', ParseUUIDPipe) bookId: string,
  ) {
    const { books, itemCount } = await this.bookService.getAllBookByAuthor(
      query,
      bookId,
    );
    const meta = new PageResponseMetaDto({
      pageOptionsDto: query,
      itemCount: itemCount,
    });
    return new PageResponseDto(books, meta);
  }

  @Public()
  @Get('recommend-by-category/:bookId')
  async getBookRecommendByCategory(
    @Query() query: BookQuery,
    @Param('bookId', ParseUUIDPipe) bookId: string,
  ) {
    const { books, itemCount } =
      await this.bookService.getRecommendBooksByCategory(query, bookId);
    const meta = new PageResponseMetaDto({
      pageOptionsDto: query,
      itemCount: itemCount,
    });
    return new PageResponseDto(books, meta);
  }

  @Get('recommend/cart')
  async getRecommendBookByCart(
    @UserSession() user: TUserSession,
    @Query() query: BookQuery,
  ) {
    const { books, itemCount } = await this.bookService.getRecommendBooksByCart(
      user,
      query,
    );
    const meta = new PageResponseMetaDto({
      pageOptionsDto: query,
      itemCount: itemCount,
    });
    return new PageResponseDto(books, meta);
  }
}
