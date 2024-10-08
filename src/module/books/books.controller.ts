import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { DOCUMENTATION, END_POINTS, ORDER } from 'src/utils/constants';
import { CreateBookDto } from './dto/create-book.dto';
import { BooksService } from './books.service';
import { StandardResponse } from 'src/utils/response.dto';
import { Books } from '@prisma/client';
import HttpStatusCode from 'src/utils/HttpStatusCode';
import { PageResponseDto } from 'src/utils/page-response.dto';
import { PageResponseMetaDto } from 'src/utils/page-response-meta.dto';
import { PageOptionsDto } from 'src/utils/page-options-dto';
import { BookQuery } from './query/book.query';

const {
  BOOKS: { BASE, GET_ALL, CREATE, UPDATE, GET_ONE, FILTER, SORT },
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
  async createBook(
    @Body() body: CreateBookDto,
  ): Promise<StandardResponse<Books>> {
    const newBook = await this.bookService.createBook(body);
    const message = 'Create book successfully';
    return new StandardResponse(newBook, message, HttpStatusCode.CREATED);
  }
  @ApiOperation({
    summary: 'Update a book',
    description: 'Allow admin',
  })
  @Post(UPDATE)
  async updateBook() {}
  @ApiOperation({
    summary: 'Get a book by id',
    description: 'Allow admin/ customer',
  })
  @Get(GET_ONE)
  async getBookDetailsById() {}
}
