import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OrderPageOptionsDto } from './dto/find-all-orders.dto';
import { TUserSession } from 'src/common/decorators/user-session.decorator';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrderService {
  constructor(private readonly prisma: PrismaService) {}
  async createOrder(session: TUserSession, dto: CreateOrderDto) {
    const bookIds = dto.items.map((item) => item.bookId);
    const books = await this.prisma.books.findMany({
      where: { id: { in: bookIds } },
    });
    if (books.length !== bookIds.length) {
      throw new NotFoundException('Some books are not found');
    }
    const bookPriceMap = new Map(
      books.map((book) => [
        book.id,
        { price: book.price, finalPrice: book.final_price ?? book.price },
      ]),
    );
    try {
      return await this.prisma.$transaction(async (tx) => {
        const order = await tx.orders.create({
          data: {
            user_id: session.id,
            full_name: dto.fullName,
            phone_number: dto.phoneNumber,
            address: dto.address,
          },
        });
        const orderItems = dto.items.map((item) => {
          const { price, finalPrice } = bookPriceMap.get(item.bookId);
          const totalPrice = Number(finalPrice) * item.quantity;
          return {
            order_id: order.id,
            book_id: item.bookId,
            quantity: item.quantity,
            price,
            total_price: totalPrice,
          };
        });
        await tx.orderDetails.createMany({ data: orderItems });
        const totalPrice = orderItems.reduce(
          (acc, item) => acc + item.total_price,
          0,
        );
        const updatedOrder = await tx.orders.update({
          where: { id: order.id },
          data: {
            total_price: totalPrice,
          },
          include: {
            OrderDetails: {
              include: {
                book: true,
              },
            },
          },
        });
        return updatedOrder;
      });
    } catch (error) {
      console.log('Error:', error);
      throw new Error('Failed to create order');
    }
  }
  async getListOrders(query: OrderPageOptionsDto) {
    const { take, order, sortBy } = query;
    const orders = this.prisma.orders.findMany({
      skip: query.skip,
      take: take,
      orderBy: { [sortBy]: order },
    });
    return orders;
  }
  async getOrderDetailsByUser(id: number, session: TUserSession) {
    const order = this.prisma.orders.findUnique({
      where: { user_id: session.id, id: id },
    });
    return order;
  }
  async getListOrdersByUser(query: OrderPageOptionsDto, session: TUserSession) {
    const { take, order, sortBy } = query;
    const orders = this.prisma.orders.findMany({
      where: { user_id: session.id },
      skip: query.skip,
      take: take,
      orderBy: { [sortBy]: order },
    });
    return orders;
  }
  async updateOrder() {}
}
