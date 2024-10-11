import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TUserSession } from 'src/common/decorators/user-session.decorator';
import { AddToCartDto } from './dto/create-cart-item.dto';
import { setServers } from 'dns';

@Injectable()
export class CartItemsService {
  constructor(private readonly prismaService: PrismaService) {}
  async createCartItem(session: TUserSession, body: AddToCartDto) {
    const { bookId, quantity } = body;
    const book = await this.prismaService.books.findFirst({
      where: { id: bookId },
    });
    if (!book) {
      throw new BadRequestException('Book not found');
    }
    const cart = await this.prismaService.carts.findFirst({
      where: { user_id: session.id },
    });
    if (!cart) {
      throw new BadRequestException('Cart not found');
    }
    const cartItem = await this.prismaService.cartItems.create({
      data: {
        cart_id: cart.id,
        book_id: bookId,
        quantity,
      },
    });
    return cartItem;
  }
  async addToCart(session: TUserSession, body: AddToCartDto) {
    const { bookId, quantity } = body;
    const book = await this.prismaService.books.findUnique({
      where: {
        id: bookId,
      },
    });
    if (!book) {
      throw new NotFoundException('Book not found');
    }
    if (book.stock_quantity < quantity) {
      throw new BadRequestException(
        'Book added to cart partially due to limited stock',
      );
    }
    try {
      if (book.stock_quantity >= quantity) {
        const cart = await this.prismaService.carts.findFirst({
          where: { user_id: session.id },
        });
        if (!cart) {
          throw new BadRequestException('Cart not found');
        }
        const existCartItems = await this.prismaService.cartItems.findFirst({
          where: { cart_id: cart.id, book_id: bookId },
        });
        if (existCartItems) {
          const newQuantity = existCartItems.quantity + body.quantity;
          const updatedCartItem = await this.prismaService.cartItems.update({
            where: { id: existCartItems.id },
            data: {
              quantity: newQuantity,
            },
          });
          return updatedCartItem;
        } else {
          const cartItem = await this.createCartItem(session, body);
          return cartItem;
        }
      }
    } catch (error) {
      console.log('Error:', error.message);
      throw new BadRequestException({
        message: error.message,
      });
    }
  }
}
