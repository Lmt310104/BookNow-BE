import {
  Body,
  Controller,
  Get,
  Param,
  ParseFilePipeBuilder,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  DOCUMENTATION,
  END_POINTS,
  FILE_TYPES_REGEX,
} from 'src/utils/constants';
import { AuthorsSerivce } from './authors.service';
import { CreateAuthorDto } from './dto/create-author.dto';
import { AuthorPageOptionsDto } from './dto/find-all-author.dto';
import { PageResponseDto } from 'src/utils/page-response.dto';
import { Authors } from '@prisma/client';
import { PageResponseMetaDto } from 'src/utils/page-response-meta.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { StandardResponse } from 'src/utils/response.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';
const {
  AUTHORS: { BASE, GET_ALL, CREATE, UPDATE, GET_ONE, SEARCH },
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
    @Query('key') key?: string,
  ): Promise<PageResponseDto<Authors>> {
    const { authors, itemCount } = await this.authorsService.getAllAuthors(
      dto,
      key,
    );
    const meta = new PageResponseMetaDto({
      pageOptionsDto: dto,
      itemCount: itemCount,
    });
    return new PageResponseDto(authors, meta);
  }
  @ApiOperation({
    summary: 'Create a new author',
    description: 'Allow admin',
  })
  @Post(CREATE)
  @UseInterceptors(FileInterceptor('avatar'))
  async createAuthor(
    @Body() body: CreateAuthorDto,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: FILE_TYPES_REGEX,
        })
        .build({
          fileIsRequired: false,
        }),
    )
    avatar?: Express.Multer.File,
  ) {
    const result = await this.authorsService.createAuthor(body, avatar);
    return new StandardResponse(result, 'Create author successfully', 201);
  }
  @ApiOperation({
    summary: 'Update an author',
    description: 'Allow admin',
  })
  @Patch(UPDATE)
  @UseInterceptors(FileInterceptor('avatar'))
  async updateAuthor(
    @Body() dto: UpdateAuthorDto,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: FILE_TYPES_REGEX,
        })
        .build({
          fileIsRequired: false,
        }),
    )
    avatar?: Express.Multer.File,
  ) {
    const result = await this.authorsService.updateAuthor(dto, avatar);
    return new StandardResponse(result, 'Update author successfully', 200);
  }
  @ApiOperation({
    summary: 'Get an author by id',
    description: 'Allow admin/ customer',
  })
  @Get(GET_ONE)
  async getAuthorById(@Param('id') id: string) {
    const result = await this.authorsService.getAuthorById(id);
    return new StandardResponse(result, 'Get author successfully', 200);
  }
  @Get(SEARCH)
  async searchAuthor(
    @Query() query: AuthorPageOptionsDto,
    @Query('key') key: string,
  ) {
    const { authors, itemCount } = await this.authorsService.searchAuthor(
      query,
      key,
    );
    const meta = new PageResponseMetaDto({ pageOptionsDto: query, itemCount });
    return new PageResponseDto(authors, meta);
  }
}
