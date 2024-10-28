import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { DOCUMENTATION, END_POINTS } from 'src/utils/constants';
import { CreateCategoryDto } from './dtos/create-category.dto';
import { CategoryService } from './categories.service';
import { StandardResponse } from 'src/utils/response.dto';
import { Category } from '@prisma/client';
import HttpStatusCode from 'src/utils/HttpStatusCode';
import { PageResponseDto } from 'src/utils/page-response.dto';
import { PageResponseMetaDto } from 'src/utils/page-response-meta.dto';
import { UpdateCategoryDto } from './dtos/update-category.dto';
import { CategoryPageOptionsDto } from './dtos/find-all-categories.dto';
import { PageOptionsDto } from 'src/utils/page-options-dto';

const {
  CATEGORIES: {
    BASE,
    CREATE,
    GET_ALL,
    GET_ONE,
    UPDATE,
    DISABLE,
    ENABLE,
    SEARCH,
  },
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
  async getAll(
    @Query() query: CategoryPageOptionsDto,
    @Query('disable', new DefaultValuePipe(undefined))
    disable?: boolean,
  ): Promise<PageResponseDto<Category>> {
    const { categories, itemCount } = await this.categoryService.getCategories(
      query,
      disable,
    );
    const meta = new PageResponseMetaDto({
      pageOptionsDto: query,
      itemCount: itemCount,
    });
    return new PageResponseDto(categories, meta);
  }
  @Get(GET_ONE)
  async getCategoryById(@Param('id', ParseUUIDPipe) id: string) {
    return new StandardResponse(
      await this.categoryService.getCategoryById(id),
      'Get category successfully',
      HttpStatusCode.OK,
    );
  }
  @Post(DISABLE)
  async disableCategory(@Param('id', ParseUUIDPipe) id: string) {
    const result = await this.categoryService.disableCategory(id);
    const message = 'Disable category successfully';
    return new StandardResponse(result, message, HttpStatusCode.OK);
  }
  @Put(UPDATE)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCategoryDto,
  ) {
    const category = await this.categoryService.update(id, dto);
    const message = 'Update category successfully';
    return new StandardResponse(category, message, HttpStatusCode.OK);
  }
  @Post(ENABLE)
  async enable(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<StandardResponse<Category>> {
    const category = await this.categoryService.enable(id);
    const message = 'Enable category successfully';
    return new StandardResponse(category, message, HttpStatusCode.OK);
  }
  @Get(SEARCH)
  async search(
    @Query(new ValidationPipe({ transform: true }))
    pageOption: CategoryPageOptionsDto,
    @Query('disable', new DefaultValuePipe(undefined)) disable?: boolean,
    @Query('query', new DefaultValuePipe(undefined)) query?: string,
  ) {
    const { categories, itemCount } = await this.categoryService.search(
      query,
      pageOption,
      disable,
    );
    const meta = new PageResponseMetaDto({
      pageOptionsDto: pageOption,
      itemCount: itemCount,
    });
    return new PageResponseDto(categories, meta);
  }
}
