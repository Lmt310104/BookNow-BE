import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { DOCUMENTATION, END_POINTS } from 'src/utils/constants';
import { PromotionService } from './promotion.service';
import { CACHE_MANAGER, CacheInterceptor } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import {
  CreateNormalPromotionDto,
  CreatePromotionComboDto,
  CreatePromotionShockDealDto,
} from './dto/create-promotion.dto';
import { FindAllPromotionDto } from './dto/find-all-promotion.dto';
import { GetAvailableBookForPromotionDto } from './dto/get-available-promotion.dto';

const {
  PROMOTION: {
    BASE,
    GET_ALL,
    GET_ONE,
    CREATE_NORMAL,
    CREATE_COMBO,
    CREATE_SHOCK_DEAL,
    CREATE_GROUP_BUY,
    ACTIVE,
    INACTIVE,
    UPDATE,
    EDIT_TIME,
  },
} = END_POINTS;

@ApiTags(DOCUMENTATION.TAGS.PROMOTION)
@Controller(BASE)
@UseInterceptors(CacheInterceptor)
export class PromotionController {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly promotionService: PromotionService,
  ) {}

  @ApiOperation({
    description: 'Create new combo promotion',
  })
  @Post(CREATE_COMBO)
  async createNewPromotionCombo(@Body() dto: CreatePromotionComboDto) {
    return await this.promotionService.CreateNewPromotionCombo(dto);
  }

  @ApiOperation({
    description: 'Create new normal promotion',
  })
  @Post(CREATE_NORMAL)
  async createNewNormalPromotion(@Body() dto: CreateNormalPromotionDto) {
    return await this.promotionService.CreateNewNormalPromotion(dto);
  }

  @ApiOperation({
    description: 'Create new shock deal promotion',
  })
  @Post(CREATE_SHOCK_DEAL)
  async createNewPromotionSockDeal(@Body() dto: CreatePromotionShockDealDto) {
    return await this.promotionService.CreateNewPromotionShockDeal(dto);
  }

  @ApiOperation({
    summary: 'Create new group promotion campaign',
    description:
      'Create new group promotion campaign with combo, normal or shock deal',
  })
  @Post(CREATE_GROUP_BUY)
  async createNewGroupPromotionCampaign(@Body() dto: CreatePromotionComboDto) {
    return await this.promotionService.CreateNewPromotionGroupBuy(dto);
  }

  @ApiOperation({
    summary: 'Get all promotion campaigns in current system',
  })
  @Get(GET_ALL)
  async getAllPromotions(@Query() query: FindAllPromotionDto) {
    return await this.promotionService.getAllPromotions(query);
  }

  @Get(GET_ONE)
  @ApiOperation({
    summary: 'Get promotion details by id',
  })
  async getOnePromotion(@Param('id') id: string) {
    return await this.promotionService.getOnePromotion(id);
  }

  @Post(ACTIVE)
  @ApiOperation({
    summary: 'Active promotion campaign by id',
  })
  async activatePromotion(@Param('id') id: string) {
    return await this.promotionService.activatePromotion(id);
  }

  @Post(INACTIVE)
  @ApiOperation({
    summary: 'Inactive promotion campaign by id',
  })
  async deactivatePromotion(@Param('id') id: string) {
    return await this.promotionService.deactivatePromotion(id);
  }

  @Patch(UPDATE)
  @ApiOperation({
    summary: 'Update promotion campaign by id',
  })
  async updatePromotion(@Param('id') id: string, @Body() body: any) {
    return await this.promotionService.updatePromotion(id, body);
  }
  @Post(EDIT_TIME)
  @ApiOperation({
    summary: 'Edit promotion campaign time',
  })
  async editPromotionTime(@Param('id') id: string, @Body() dto: any) {
    return await this.promotionService.editPromotionTime(id, dto);
  }

  @Get('get-available-books')
  @ApiOperation({
    summary: 'Find books that can be added to a promotion campaign',
  })
  async searchAvailablePromotion(
    @Query() query: GetAvailableBookForPromotionDto,
  ) {
    return await this.promotionService.getAvailableBookForPromotion(query);
  }
}
