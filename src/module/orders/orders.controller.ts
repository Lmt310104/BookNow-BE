import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { END_POINTS, ROLE } from 'src/utils/constants';
import { OrderService } from './orders.service';
import {
  TUserSession,
  UserSession,
} from 'src/common/decorators/user-session.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { OrderPageOptionsDto } from './dto/find-all-orders.dto';
import { PageResponseMetaDto } from 'src/utils/page-response-meta.dto';
import { PageResponseDto } from 'src/utils/page-response.dto';
import { Orders, Reviews } from '@prisma/client';
import { StandardResponse } from 'src/utils/response.dto';
import HttpStatusCode from 'src/utils/HttpStatusCode';
import { CreateOrderDto } from './dto/create-order.dto';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

const {
  ORDER: {
    BASE,
    GET_FULL_LIST,
    GET_ALL,
    CREATE,
    UPDATE_STATUS,
    GET_ONE,
    CANCEL_ORDER,
  },
} = END_POINTS;

@Controller(BASE)
export class OrdersController {
  constructor(private readonly orderService: OrderService) {}
  @Get(GET_FULL_LIST)
  @Roles(ROLE.ADMIN)
  async getListOrders(
    @Query() query: OrderPageOptionsDto,
  ): Promise<PageResponseDto<Orders>> {
    const { orders, itemCount } = await this.orderService.getListOrders(query);
    const meta = new PageResponseMetaDto({
      pageOptionsDto: query,
      itemCount: itemCount,
    });
    return new PageResponseDto(orders, meta);
  }
  @Get(GET_ALL)
  async getAllOrders(
    @Query() query: OrderPageOptionsDto,
    @UserSession() session: TUserSession,
  ): Promise<PageResponseDto<Orders>> {
    const { orders, itemCount } = await this.orderService.getListOrdersByUser(
      query,
      session,
    );
    const meta = new PageResponseMetaDto({
      pageOptionsDto: query,
      itemCount: itemCount,
    });
    return new PageResponseDto(orders, meta);
  }
  @Post(CREATE)
  async createOrder(
    @UserSession() session: TUserSession,
    @Body() dto: CreateOrderDto,
  ) {
    const order = await this.orderService.createOrder(session, dto);
    const message = 'Order created successfully';
    return new StandardResponse<Orders>(order, message, HttpStatusCode.CREATED);
  }
  @Post(UPDATE_STATUS)
  async updateOrderStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    const order = await this.orderService.updateOrderStatus(id, dto);
    const message = 'Order status updated successfully';
    return new StandardResponse<Orders>(order, message, HttpStatusCode.OK);
  }
  @Get(GET_ONE)
  async getOrderDetails(
    @UserSession() session: TUserSession,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<StandardResponse<Orders>> {
    const order = await this.orderService.getOrderProductsByUser(id, session);
    const message = 'Order details retrieved successfully';
    return new StandardResponse<Orders>(order, message, HttpStatusCode.OK);
  }
  @Post(`${GET_ONE}/order-details/:orderDetailsId/:bookId`)
  async createReview(
    @UserSession() session: TUserSession,
    @Body() dto: CreateReviewDto,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('orderDetailsId', ParseUUIDPipe) orderDetailsId: string,
    @Param('bookId', ParseUUIDPipe) bookId: string,
  ): Promise<StandardResponse<Reviews>> {
    console.log(dto);
    const review = await this.orderService.createReview(
      session,
      dto,
      id,
      orderDetailsId,
      bookId,
    );
    const message = 'Comment created successfully';
    return new StandardResponse(review, message, HttpStatusCode.CREATED);
  }
  @Patch(CANCEL_ORDER)
  async cancelOrder(
    @Param('id', ParseUUIDPipe) id: string,
    @UserSession() session: TUserSession,
  ) {
    const order = await this.orderService.cancelOrder(id, session);
    const message = 'Order cancelled successfully';
    return new StandardResponse(order, message, HttpStatusCode.OK);
  }
}
