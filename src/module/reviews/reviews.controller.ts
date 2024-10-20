import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DOCUMENTATION, END_POINTS } from 'src/utils/constants';
import { ReviewsService } from './reviews.service';
import { PageResponseDto } from 'src/utils/page-response.dto';
import { Reviews } from '@prisma/client';
import { PageResponseMetaDto } from 'src/utils/page-response-meta.dto';
import { GetReviewsDto } from './dto/find-all-rating-reviews.dto';

const {
  COMMENT: { BASE, GET_ALL, GET_ONE },
} = END_POINTS;

@Controller(BASE)
@ApiTags(DOCUMENTATION.TAGS.COMMENT)
export class ReviewsController {
  constructor(private readonly commentService: ReviewsService) {}
  @Get(GET_ALL)
  async getAll(
    @Query() query: GetReviewsDto,
  ): Promise<PageResponseDto<Reviews>> {
    const reviews = await this.commentService.getAllReviews(query);
    const pageResponseMetaDto = new PageResponseMetaDto({
      pageOptionsDto: query,
      itemCount: reviews.length,
    });
    return new PageResponseDto<Reviews>(reviews, pageResponseMetaDto);
  }
  @Get(GET_ONE)
  async getOne(@Param('id', ParseIntPipe) id: number) {
    return await this.commentService.getReviewDetails(id);
  }
}
