import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TUserSession } from 'src/common/decorators/user-session.decorator';
import { GetCartDto } from './dto/get-cart.dto';

@Injectable()
export class CartsService {
  constructor(private readonly prisma: PrismaService) {}
  async createCart(session: TUserSession) {
    const existingCart = await this.prisma.carts.findUnique({
      where: { user_id: session.id },
    });
    if (existingCart) {
      throw new BadRequestException('Cart already exists');
    }
    const newCart = this.prisma.carts.create({
      data: {
        user_id: session.id,
      },
    });
    return newCart;
  }
  async getAllCartItems(session: TUserSession, getCartDto: GetCartDto) {
    const { id } = session;
    const cart = await this.prisma.carts.findFirst({
      where: { user_id: id },
    });
    if (!cart) {
      throw new BadRequestException('Cart not found');
    }
    const cartItems = await this.prisma.cartItems.findMany({
      where: { cart_id: cart.id },
      include: { book: true },
      skip: getCartDto.skip,
      take: getCartDto.take,
      orderBy: { [getCartDto.sortBy]: getCartDto.order },
    });
    return cartItems;
  }
}
