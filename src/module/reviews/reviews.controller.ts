import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DOCUMENTATION, END_POINTS } from 'src/utils/constants';
import { ReviewsService } from './reviews.service';
import { PageResponseDto } from 'src/utils/page-response.dto';
import { ReplyReviews, Reviews } from '@prisma/client';
import { PageResponseMetaDto } from 'src/utils/page-response-meta.dto';
import { GetReviewsDto } from './dto/find-all-rating-reviews.dto';
import { AdminReplyReviewDto } from './dto/reply-rating-reviews.dto';
import { StandardResponse } from 'src/utils/response.dto';
import HttpStatusCode from 'src/utils/HttpStatusCode';

const {
  REVIEW: { BASE, GET_ALL, GET_ONE, REPLY },
} = END_POINTS;

@Controller(BASE)
@ApiTags(DOCUMENTATION.TAGS.COMMENT)
export class ReviewsController {
  constructor(private readonly reviewService: ReviewsService) {}
  @Get(GET_ALL)
  async getAll(
    @Query() query: GetReviewsDto,
  ): Promise<PageResponseDto<Reviews>> {
    const reviews = await this.reviewService.getAllReviews(query);
    const pageResponseMetaDto = new PageResponseMetaDto({
      pageOptionsDto: query,
      itemCount: reviews.length,
    });
    return new PageResponseDto<Reviews>(reviews, pageResponseMetaDto);
  }
  @Get(GET_ONE)
  async getOne(@Param('id', ParseIntPipe) id: number) {
    return await this.reviewService.getReviewDetails(id);
  }
  @Post(REPLY)
  async replyReview(
    @Param('id', ParseIntPipe) id: number,
    dto: AdminReplyReviewDto,
  ) {
    const reply = await this.reviewService.createAdminReply(id, dto);
    return new StandardResponse<ReplyReviews>(
      reply,
      'Create reply successfully',
      HttpStatusCode.CREATED,
    );
  }
}
