import { Body, Controller, Get, Post } from '@nestjs/common';
import { DOCUMENTATION, END_POINTS } from 'src/utils/constants';
import { UserSession } from 'src/common/decorators/user-session.decorator';
import { CartItemsService } from './cart-items.service';
import { AddToCartDto } from './dto/create-cart-item.dto';
import { ApiTags } from '@nestjs/swagger';

const {
  CART_ITEM: { BASE, CREATE, UPDATE, GET_DETAILS },
} = END_POINTS;

@Controller(BASE)
@ApiTags(DOCUMENTATION.TAGS.CART_ITEMS)
export class CartItemsController {
  constructor(private readonly cartService: CartItemsService) {}
  @Post(CREATE)
  async AddCartItemIntoCart(
    @UserSession() session,
    @Body() body: AddToCartDto,
  ) {
    const cart = await this.cartService.createCartItem(session, body);
    return cart;
  }
  @Post(UPDATE)
  async UpdateCartItem() {}
  @Get(GET_DETAILS)
  async GetCartItemDetails() {}
}
