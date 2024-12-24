import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  Res,
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
import { CreatePaymentUrlDto } from './dto/create-payment-url.dto';
import { Public } from 'src/common/decorators/public.decorator';
import { Request, Response } from 'express';

const {
  ORDER: {
    BASE,
    GET_FULL_LIST,
    GET_ALL,
    CREATE,
    UPDATE_STATUS,
    GET_ONE,
    CANCEL_ORDER,
    GET_ONE_BY_ADMIN,
    CREATE_PAYMENT_URL_WITH_MOMO,
    CALLBACK_WITH_MOMO,
    GET_PAYMENT_STATUS_WITH_MOMO,
    CREATE_PAYMENT_URL_WITH_ZALO,
    CALLBACK_WITH_ZALO,
    GET_PAYMENT_STATUS_WITH_ZALO,
    CREATE_PAYMENT_URL_WITH_VNPAY,
    CALLBACK_WITH_VNPAY,
    GET_PAYMENT_STATUS_WITH_VNPAY,
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
  @Get(GET_ONE_BY_ADMIN)
  async getOrderDetailsByAdmin(@Param('id', ParseUUIDPipe) id: string) {
    const order = await this.orderService.getOrderDetailsByAdmin(id);
    const message = 'Order details retrive';
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

  @Post(CREATE_PAYMENT_URL_WITH_MOMO)
  async createPaymentUrlWithMomo(
    @UserSession() session: TUserSession,
    @Body() dto: CreatePaymentUrlDto,
  ) {
    const paymentUrl = await this.orderService.createPaymentUrlWithMomo(
      session,
      dto,
    );
    const message = 'Payment url created successfully';
    return new StandardResponse(paymentUrl, message, HttpStatusCode.CREATED);
  }

  @Public()
  @Post(CALLBACK_WITH_MOMO)
  async callbackWithMomo(@Req() req: Request, @Res() res: Response) {
    await this.orderService.callbackWithMomo(req, res);
  }

  @Post(CREATE_PAYMENT_URL_WITH_ZALO)
  async createPaymentUrlWithZalo(
    @UserSession() session: TUserSession,
    @Body() dto: CreatePaymentUrlDto,
  ) {
    const paymentUrl = await this.orderService.createPaymentUrlWithZaloPay(
      dto,
      session,
    );
    const message = 'Payment url created successfully';
    return new StandardResponse(paymentUrl, message, HttpStatusCode.CREATED);
  }

  @Public()
  @Post(CALLBACK_WITH_ZALO)
  async callbackWithZalo(@Req() req: Request) {
    await this.orderService.callbackWithZaloPay(req);
  }

  @Public()
  @Get(GET_PAYMENT_STATUS_WITH_ZALO)
  async getPaymentStatusWithZalo(@Query() query: any) {
    const result = await this.orderService.getPaymentStatusWithZaloPay(query);
    return result;
  }

  @Public()
  @Get(GET_PAYMENT_STATUS_WITH_MOMO)
  async getPaymentStatusWithMomo(@Query() query: any) {
    const result = await this.orderService.validatePaymentWithMomo(query);
    return result;
  }

  @Post(CREATE_PAYMENT_URL_WITH_VNPAY)
  async createPaymentUrlWithVNPay(
    @Req() req: Request,
    @Body() dto: CreatePaymentUrlDto,
  ) {
    const paymentUrl = await this.orderService.createPaymentUrlWithVNPay(
      dto,
      req,
    );
    const message = 'Payment url created successfully';
    return new StandardResponse(paymentUrl, message, HttpStatusCode.CREATED);
  }

  @Public()
  @Get(CALLBACK_WITH_VNPAY)
  async callbackWithVNPay(@Req() req: Request, @Res() res: Response) {
    await this.orderService.callbackWithVNPay(req, res);
  }

  @Public()
  @Get(GET_PAYMENT_STATUS_WITH_VNPAY)
  async getPaymentStatusWithVNPay(@Query() query: any) {
    const result = await this.orderService.validatePaymentWithVNPay(query);
    return result;
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
