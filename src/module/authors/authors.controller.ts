import { Body, Controller, Get, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { DOCUMENTATION, END_POINTS } from 'src/utils/constants';
import { AuthorsSerivce } from './authors.service';
import { CreateAuthorDto } from './dto/create-author.dto';
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
  async getAllAuthors() {}
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
