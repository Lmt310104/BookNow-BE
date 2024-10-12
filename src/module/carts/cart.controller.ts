import { Controller, Get, Post } from '@nestjs/common';
import { Carts } from '@prisma/client';
import {
  TUserSession,
  UserSession,
} from 'src/common/decorators/user-session.decorator';
import HttpStatusCode from 'src/utils/HttpStatusCode';
import { StandardResponse } from 'src/utils/response.dto';
import { CartsService } from './carts.service';
import { DOCUMENTATION, END_POINTS } from 'src/utils/constants';
import { ApiTags } from '@nestjs/swagger';
import { GetCartDto } from './dto/get-cart.dto';
import { PageResponseDto } from 'src/utils/page-response.dto';
import { PageResponseMetaDto } from 'src/utils/page-response-meta.dto';

const {
  CARTS: { BASE, CREATE, GET_ALL },
} = END_POINTS;

@Controller(BASE)
@ApiTags(DOCUMENTATION.TAGS.CARTS)
export class CartController {
  constructor(private readonly cartService: CartsService) {}
  @Post(CREATE)
  async createCart(
    @UserSession() session: TUserSession,
  ): Promise<StandardResponse<Carts>> {
    const cart = await this.cartService.createCart(session);
    const message = 'Cart created successfully';
    return new StandardResponse(cart, message, HttpStatusCode.CREATED);
  }
  @Get(GET_ALL)
  async getAllCartItem(
    @UserSession() session: TUserSession,
    getCartDto: GetCartDto,
  ) {
    const cartItems = await this.cartService.getAllCartItems(
      session,
      getCartDto,
    );
    const meta = new PageResponseMetaDto({
      pageOptionsDto: getCartDto,
      itemCount: cartItems.length,
    });
    return new PageResponseDto(cartItems, meta);
  }
}
