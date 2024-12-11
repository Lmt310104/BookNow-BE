import { Controller, Get, Query } from '@nestjs/common';
import { END_POINTS } from 'src/utils/constants';
import { StatisticQuery } from './dto/overview_statistic_query.dto';
import { StatisticService } from './statistic.service';
import { StandardResponse } from 'src/utils/response.dto';
const {
  STATISTIC: {
    BASE,
    GET_OVERVIEW_STATISTIC,
    GET_PRODUCT_STATISTIC_BY_ADD_TO_CART,
    GET_PRODUCT_STATISTIC_BY_ORDER,
    GET_PRODUCT_STATISTIC_BY_REVENUE,
    GET_REVENUE_STATISTIC_BY_CUSTOMER,
    GET_REVENUE_STATISTIC_BY_CATEGROY,
    GET_PRODUCT_STATISTIC_BY_SOLD_QUANTITY,
    GET_REVENUE_STATISTIC_BY_DATE,
  },
} = END_POINTS;

@Controller(BASE)
export class StatisticController {
  constructor(private readonly statisticService: StatisticService) {}
  @Get(GET_OVERVIEW_STATISTIC)
  async getStatistic(@Query() query: StatisticQuery) {
    const statistic = await this.statisticService.getStatistic(query);
    return new StandardResponse(
      statistic,
      'Get overview statistic successfully',
      200,
    );
  }
  @Get(GET_PRODUCT_STATISTIC_BY_REVENUE)
  async getProductStatisByRevenue(@Query() query: StatisticQuery) {
    return new StandardResponse(
      await this.statisticService.getProductStatisByRevenue(query),
      'Get product statistic by revenue successfully',
      200,
    );
  }
  @Get(GET_PRODUCT_STATISTIC_BY_ADD_TO_CART)
  async getProductStatisByAddToCart(@Query() query: StatisticQuery) {
    return new StandardResponse(
      await this.statisticService.getProductStatisByAddToCart(query),
      'Get product statistic by add to cart successfully',
      200,
    );
  }
  @Get(GET_PRODUCT_STATISTIC_BY_ORDER)
  async getProductStatisByOrder(@Query() query: StatisticQuery) {
    return new StandardResponse(
      await this.statisticService.getProductStatisByOrder(query),
      'Get product statistic by order successfully',
      200,
    );
  }
  @Get(GET_PRODUCT_STATISTIC_BY_SOLD_QUANTITY)
  async getProductStatisBySoldQuantity(@Query() query: StatisticQuery) {
    return new StandardResponse(
      await this.statisticService.getProductStatisBySoldQuantity(query),
      'Get product statistic by sold quantity successfully',
      200,
    );
  }
  @Get(GET_REVENUE_STATISTIC_BY_CUSTOMER)
  async getRevenueStatisByCustomer(@Query() query: StatisticQuery) {
    return new StandardResponse(
      await this.statisticService.getRevenueStatisByCustomer(query),
      'Get revenue statistic by customer successfully',
      200,
    );
  }
  @Get(GET_REVENUE_STATISTIC_BY_CATEGROY)
  async getRevenueStatisByCategory(@Query() query: StatisticQuery) {
    return new StandardResponse(
      await this.statisticService.getRevenueStatisByCategory(query),
      'Get revenue statistic by category successfully',
      200,
    );
  }
  @Get(GET_REVENUE_STATISTIC_BY_DATE)
  async getRevenueStatisByDate(@Query() query: StatisticQuery){
    return new StandardResponse(
      await this.statisticService.getRevenueStatisByDate(query),
      'Get revenue statistic by date successfully',
      200,
    );
  }
}
