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
  UploadedFile,
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
import { FileInterceptor } from '@nestjs/platform-express';
import { PriceFilterDto } from './dto/filter-by-price.dto';
import { RatingFilterDto } from './dto/filter-by-rating.dto';

const {
  BOOKS: {
    BASE,
    GET_ALL,
    CREATE,
    UPDATE,
    GET_ONE,
    SEARCH_BY_PRICE,
    SEARCH_BY_RATING,
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
  @UsePipes(new ValidationPipe({ transform: true }))
  async getAllBooks(
    @Query() bookQuery: BookQuery,
  ): Promise<PageResponseDto<Books>> {
    const books: Books[] = await this.bookService.getAllBooks(bookQuery);
    const pageOptionsDto = new PageOptionsDto(bookQuery);
    const meta = new PageResponseMetaDto({
      pageOptionsDto,
      itemCount: books.length,
    });
    return new PageResponseDto(books, meta);
  }
  @ApiOperation({
    summary: 'Create a new book',
    description: 'Allow admin',
  })
  @Post(CREATE)
  @UseInterceptors(FileInterceptor('image'))
  async createBook(
    @Body() body: CreateBookDto,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: FILE_TYPES_REGEX,
        })
        .build({
          fileIsRequired: false,
        }),
    )
    image?: Express.Multer.File,
  ): Promise<StandardResponse<Books>> {
    const newBook: Books = await this.bookService.createBook(body, image);
    const message = 'Create book successfully';
    return new StandardResponse(newBook, message, HttpStatusCode.CREATED);
  }
  @ApiOperation({
    summary: 'Update a book',
    description: 'Allow admin',
  })
  @Patch(UPDATE)
  @UseInterceptors(FileInterceptor('image'))
  async updateBook(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateBookDto,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: FILE_TYPES_REGEX,
        })
        .build({
          fileIsRequired: false,
        }),
    )
    image?: Express.Multer.File,
  ): Promise<StandardResponse<Books>> {
    const updatedBook: Books = await this.bookService.updateBook(
      id,
      dto,
      image,
    );
    const message = 'Update book successfully';
    return new StandardResponse(updatedBook, message, HttpStatusCode.OK);
  }
  @ApiOperation({
    summary: 'Get a book by id',
    description: 'Allow admin/ customer',
  })
  @Get(GET_ONE)
  async getBookDetailsById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<StandardResponse<Books>> {
    const book: Books = await this.bookService.getBookDetailsById(id);
    const message = 'Get book successfully';
    return new StandardResponse(book, message, HttpStatusCode.OK);
  }
  @Post(SEARCH_BY_PRICE)
  async searchByPrice(@Body() dto: PriceFilterDto) {
    const books = await this.bookService.searchByPrice(dto);
    return new StandardResponse(
      books,
      'Search by price successfully',
      HttpStatusCode.OK,
    );
  }
  @Post(SEARCH_BY_RATING)
  async searchByRating(@Body() dto: RatingFilterDto) {
    const books = await this.bookService.searchByRating(dto);
    return new StandardResponse(
      books,
      'Search by rating successfully',
      HttpStatusCode.OK,
    );
  }
}
