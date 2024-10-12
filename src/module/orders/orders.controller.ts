import { Controller, Get, Post } from '@nestjs/common';
import { END_POINTS, ROLE } from 'src/utils/constants';
import { OrderService } from './orders.service';
import {
  TUserSession,
  UserSession,
} from 'src/common/decorators/user-session.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';

const {
  ORDER: { BASE, GET_FULL_LIST, GET_ALL, CREATE, UPDATE, GET_DETAILS },
} = END_POINTS;

@Controller(BASE)
export class OrdersController {
  constructor(private readonly orderService: OrderService) {}
  @Get(GET_FULL_LIST)
  @Roles(ROLE.ADMIN)
  async getListOrders(@UserSession() session:  TUserSession) { 
  }
  @Get(GET_ALL)
  async getAllOrders(@UserSession() session: TUserSession) {}
  @Get(CREATE)
  async createOrder() {}
  @Post(UPDATE)
  async updateOrder() {}
  @Get(GET_DETAILS)
  async getOrderDetails() {}
}
