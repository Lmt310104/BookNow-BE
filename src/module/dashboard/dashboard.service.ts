import { BOOKSTATUS, ORDER_STATUS } from 'src/utils/constants';
import { PrismaService } from '../prisma/prisma.service';
import { GetDashboardDto } from './dto/get-dashboard.dto';
import { Injectable } from '@nestjs/common';
import * as _ from 'lodash';
import { GetDashboardByDateDto } from './dto/get-dashboard-by-date.dto';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}
  async getBookReport(dto: GetDashboardDto) {
    const { month, year } = dto;
    console.log(month, year);
    const newBookCreated = await this.prisma.books.findMany({});
    const instockBook = await this.prisma.books.findMany({});
    const outOfStockBook = await this.prisma.books.findMany({});
    const inActiveBook = await this.prisma.books.findMany({});
    const lowStockBook = await this.prisma.books.findMany({});
    return {
      newBookCreated: newBookCreated.length,
      instockBook: instockBook.length,
      outOfStockBook: outOfStockBook.length,
      inActiveBook: inActiveBook.length,
      lowStockBook: lowStockBook.length,
    };
  }
  async getOrderShippingRate(dto: GetDashboardDto) {}
  async getDashboardByDate(dto: GetDashboardByDateDto) {
    const { date } = dto;
    const dateFormat = new Date(date).toISOString();
    const totalOrder = await this.prisma.orders.findMany({
      where: {
        created_at: {
          gte: new Date(dateFormat),
          lt: new Date(
            new Date(dateFormat).setDate(new Date(dateFormat).getDate() + 1),
          ),
        },
      },
    });
    const isWaitingConfirmed = _.filter(totalOrder, {
      status: ORDER_STATUS.PENDING,
    });
    const isShipping = _.filter(totalOrder, {
      status: ORDER_STATUS.DELIVERED,
    });
    const isSuccess = _.filter(totalOrder, {
      status: ORDER_STATUS.SUCCESS,
    });
    return {
      totalOrder: totalOrder.length,
      isWaitingConfirmed: isWaitingConfirmed.length,
      isShipping: isShipping.length,
      isDelivered: isSuccess.length,
    };
  }
}
