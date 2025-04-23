import { Controller, Get, Post, Query } from '@nestjs/common';
import { END_POINTS } from 'src/utils/constants';
import { RecommendationService } from './recommendation.service';
import { Public } from 'src/common/decorators/public.decorator';
import {
  TUserSession,
  UserSession,
} from 'src/common/decorators/user-session.decorator';
import { ApiOperation } from '@nestjs/swagger';
import { GetRecommendationByUserQuery } from './dto/get-recommendation-by-user.query.dto';

const {
  RECOMMENDATION: {
    BASE,
    RECOMMEND_FOR_YOU,
    ADD_ITEMS_PROPERTIES,
    ADD_USER_PROPERTIES,
  },
} = END_POINTS;
@Controller(BASE)
export class RecommendationController {
  constructor(private readonly recommendationService: RecommendationService) {}

  @Public()
  @Post(ADD_ITEMS_PROPERTIES)
  async addEntityPropertiesToRecombee() {
    await this.recommendationService.addEntityPropertiesToRecombee();
  }

  @Public()
  @Post(ADD_USER_PROPERTIES)
  async addUserPropertiesToRecombee() {
    await this.recommendationService.addUserPropertiesToRecombee();
  }

  @ApiOperation({
    summary: 'Get all recommendations for you',
  })
  @Get(RECOMMEND_FOR_YOU)
  async GetRecommendForYou(
    @UserSession() user: TUserSession,
    @Query() query: GetRecommendationByUserQuery,
  ) {
    return await this.recommendationService.recommendBooks(
      user.id,
      query.search,
      query.take,
      query.page,
    );
  }
}
