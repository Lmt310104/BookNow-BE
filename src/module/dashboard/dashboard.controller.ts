import { Body, Controller, Get } from '@nestjs/common';
import { END_POINTS } from 'src/utils/constants';
import { GetDashboardDto } from './dto/get-dashboard.dto';
import { DashboardService } from './dashboard.service';
const {
  DASHBOARD: {
    BASE,
    GET_BOOK_REPORT,
    GET_ORDER_REPORT,
    GET_ORDER_SHPPING_RATE,
  },
} = END_POINTS;
@Controller(BASE)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}
  @Get(GET_BOOK_REPORT)
  async getBookReport(@Body() dto: GetDashboardDto) {
    return await this.dashboardService.getBookReport(dto);
  }
  @Get(GET_ORDER_REPORT)
  async getOrderReport(@Body() dto: GetDashboardDto) {
    return {
      message: 'Order report',
    };
  }
  @Get(GET_ORDER_SHPPING_RATE)
  async getOrderShippingRate(@Body() dto: GetDashboardDto) {
    return {
      message: 'Order shipping rate',
    };
  }
}
