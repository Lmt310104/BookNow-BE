import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { DOCUMENTATION, END_POINTS, ORDER } from 'src/utils/constants';
import { CreateCategoryDto } from './dtos/create-category.dto';
import { CategoryService } from './categories.service';
import { StandardResponse } from 'src/utils/response.dto';
import { Category } from '@prisma/client';
import HttpStatusCode from 'src/utils/HttpStatusCode';
import { PageResponseDto } from 'src/utils/page-response.dto';
import { PageOptionsDto } from 'src/utils/page-options-dto';
import { PageResponseMetaDto } from 'src/utils/page-response-meta.dto';

const {
  CATEGORIES: { BASE, CREATE, GET_ALL, GET_ONE, UPDATE },
} = END_POINTS;
@ApiTags(DOCUMENTATION.TAGS.CATEGORIES)
@Controller(BASE)
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}
  @Post(CREATE)
  async create(
    @Body() body: CreateCategoryDto,
  ): Promise<StandardResponse<Category>> {
    const category = await this.categoryService.create(body);
    const message = 'Create category successfully';
    return new StandardResponse(category, message, HttpStatusCode.CREATED);
  }
  @Get(GET_ALL)
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
    name: 'order',
    required: false,
    enum: ORDER,
    description: 'Sorting order',
  })
  async getAll(
    @Query() pageOptionsDto: PageOptionsDto,
  ): Promise<PageResponseDto<Category>> {
    const categories: Category[] = await this.categoryService.getAll();
    const meta = new PageResponseMetaDto({
      pageOptionsDto,
      itemCount: categories.length,
    });
    return new PageResponseDto(categories, meta);
  }
  @Get(GET_ONE)
  async getBooksByCategory() {}
  @Post(UPDATE)
  async update() {}
}
