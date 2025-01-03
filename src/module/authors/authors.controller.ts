import { Body, Controller, Get, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { DOCUMENTATION, END_POINTS } from 'src/utils/constants';
import { AuthorsSerivce } from './authors.service';
import { CreateAuthorDto } from './dto/create-author.dto';
import { AuthorPageOptionsDto } from './dto/find-all-author.dto';
import { PageResponseDto } from 'src/utils/page-response.dto';
import { Authors } from '@prisma/client';
import { PageResponseMetaDto } from 'src/utils/page-response-meta.dto';
const {
  AUTHORS: { BASE, GET_ALL, CREATE, UPDATE, GET_ONE },
} = END_POINTS;

@ApiTags(DOCUMENTATION.TAGS.AUTHORS)
@Controller(BASE)
export class AuthorsController {
  constructor(private readonly authorsService: AuthorsSerivce) {}
  @ApiOperation({
    summary: 'Get all authors',
    description: 'Allow admin/ customer',
  })
  @Get(GET_ALL)
  async getAllAuthors(
    @Query() dto: AuthorPageOptionsDto,
  ): Promise<PageResponseDto<Authors>> {
    const authors = await this.authorsService.getAllAuthors(dto);
    const meta = new PageResponseMetaDto({
      pageOptionsDto: dto,
      itemCount: authors.length,
    });
    return new PageResponseDto(authors, meta);
  }
  @ApiOperation({
    summary: 'Create a new author',
    description: 'Allow admin',
  })
  @Post(CREATE)
  async createAuthor(@Body() body: CreateAuthorDto) {
    await this.authorsService.createAuthor(body);
  }
  @ApiOperation({
    summary: 'Update an author',
    description: 'Allow admin',
  })
  @Patch(UPDATE)
  async updateAuthor() {}
  @ApiOperation({
    summary: 'Get an author by id',
    description: 'Allow admin/ customer',
  })
  @Get(GET_ONE)
  async getAuthorById() {}
}
