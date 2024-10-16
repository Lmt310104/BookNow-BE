import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TUserSession } from 'src/common/decorators/user-session.decorator';
import { GetCartDto } from './dto/get-cart.dto';
import { AddToCartDto } from './dto/add-to-cart.dto';

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
  async addToCart(session: TUserSession, addToCartDto: AddToCartDto) {
    console.log(session, addToCartDto);
    const { bookId, quantity } = addToCartDto;
    const cart = await this.prisma.carts.findFirst({
      where: { user_id: session.id },
    });
    if (!cart) {
      throw new BadRequestException('Cart not found');
    }
    const book = await this.prisma.books.findUnique({
      where: { id: bookId },
    });
    if (!book) {
      throw new BadRequestException('Book not found');
    }
    const existingCartItem = await this.prisma.cartItems.findFirst({
      where: {
        book_id: bookId,
        cart_id: cart.id,
      },
    });
    if (existingCartItem) {
      await this.prisma.cartItems.update({
        where: { id: existingCartItem.id },
        data: { quantity: existingCartItem.quantity + quantity },
      });
    } else {
      await this.prisma.cartItems.create({
        data: {
          book_id: bookId,
          cart_id: cart.id,
          quantity,
        },
      });
    }
    return this.prisma.carts.findFirst({
      where: { user_id: session.id },
      include: { CartItems: { include: { book: true } } },
    });
  }
  async deleteCartItem(session: TUserSession, bookId: string) {
    const book = await this.prisma.books.findUnique({
      where: { id: bookId },
    });
    if (!book) {
      throw new BadRequestException('Book not found');
    }
    const cart = await this.prisma.carts.findFirst({
      where: { user_id: session.id },
    });
    const cartItem = await this.prisma.cartItems.findFirst({
      where: {
        book_id: bookId,
        cart_id: cart.id,
      },
    });
    if (!cartItem) {
      throw new BadRequestException('Cart item not found');
    }
    try {
      await this.prisma.cartItems.delete({
        where: {
          id: cartItem.id,
        },
      });
      return this.prisma.carts.findFirst({
        where: { user_id: session.id },
        include: { CartItems: { include: { book: true } } },
      });
    } catch (error) {
      console.log('Error:', error);
      throw new Error('Failed to delete cart item');
    }
  }
}
