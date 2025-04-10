import { Controller, Post } from '@nestjs/common';
import { END_POINTS } from 'src/utils/constants';
import { RecommendationService } from './recommendation.service';
import { Public } from 'src/common/decorators/public.decorator';

const {
  RECOMMENDATION: { BASE, ADD_ITEMS_PROPERTIES, ADD_USER_PROPERTIES },
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
}
