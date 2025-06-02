import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { END_POINTS } from 'src/utils/constants';
import { CreateOrderCommand } from './commands/create-order.command';
import { GetOrderQuery } from './queries/get-order.query';
import {
  TUserSession,
  UserSession,
} from 'src/common/decorators/user-session.decorator';
import { StandardResponse } from 'src/utils/response.dto';
import HttpStatusCode from 'src/utils/HttpStatusCode';
import { CreateOrderDto } from './dto/create-order.dto';

const { BASE, CREATE, GET_ONE } = END_POINTS.ORDER;

@Controller(BASE)
export class OrdersController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post(CREATE)
  async createOrder(
    @UserSession() session: TUserSession,
    @Body() dto: CreateOrderDto,
  ) {
    const order = await this.commandBus.execute(
      new CreateOrderCommand(session, dto),
    );

    const message = 'Order created successfully';
    return new StandardResponse(order, message, HttpStatusCode.CREATED);
  }

  @Get(`${GET_ONE}/:id`)
  async getOrder(@Param('id', ParseUUIDPipe) id: string) {
    const order = await this.queryBus.execute(new GetOrderQuery(id));

    const message = 'Order retrieved successfully';
    return new StandardResponse(order, message, HttpStatusCode.OK);
  }
}
