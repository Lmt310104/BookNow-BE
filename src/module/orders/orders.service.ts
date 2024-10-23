import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OrderPageOptionsDto } from './dto/find-all-orders.dto';
import { TUserSession } from 'src/common/decorators/user-session.decorator';
import { CreateOrderDto } from './dto/create-order.dto';
import { CreateReviewDto } from './dto/create-review.dto';
import { ORDER_STATUS } from 'src/utils/constants';

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
    const orders = await this.prisma.orders.findMany({
      skip: query.skip,
      take: take,
      orderBy: { [sortBy]: order },
    });
    const itemCount = await this.prisma.orders.count();
    return { orders, itemCount };
  }
  async getOrderDetailsByUser(id: number, session: TUserSession) {
    const order = await this.prisma.orders.findUnique({
      where: { user_id: session.id, id: id },
      include: {
        OrderDetails: {
          include: {
            book: true,
          },
        },
      },
    });
    return order;
  }
  async getListOrdersByUser(query: OrderPageOptionsDto, session: TUserSession) {
    const { take, order, sortBy } = query;
    const orders = await this.prisma.orders.findMany({
      where: { user_id: session.id },
      skip: query.skip,
      take: take,
      orderBy: { [sortBy]: order },
    });
    const itemCount = await this.prisma.orders.count({
      where: { user_id: session.id },
    });
    return { orders, itemCount };
  }
  async updateOrder() {}
  async createReview(
    session: TUserSession,
    dto: CreateReviewDto,
    id: number,
    orderDetailId: number,
    bookId: string,
  ) {
    const order = await this.prisma.orders.findUnique({
      where: { user_id: session.id, id },
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    const orderDetail = await this.prisma.orderDetails.findUnique({
      where: { id: orderDetailId },
    });
    if (!orderDetail) {
      throw new NotFoundException('Order detail not found');
    }
    const book = await this.prisma.books.findUnique({
      where: { id: bookId },
    });
    if (!book) {
      throw new NotFoundException('Book not found');
    }

    try {
      return await this.prisma.$transaction(async (tx) => {
        const newTotalReviews = book.total_reviews + 1;
        const newAvgStars =
          (Number(book.avg_stars) * book.total_reviews + dto.star) /
          newTotalReviews;
        await tx.books.update({
          where: { id: book.id },
          data: {
            total_reviews: newTotalReviews,
            avg_stars: newAvgStars,
          },
        });
        const review = await tx.reviews.create({
          data: {
            user_id: session.id,
            book_id: book.id,
            rating: dto.star,
            description: dto.description,
            title: dto.title,
          },
          include: {
            book: true,
          },
        });
        return review;
      });
    } catch (error) {
      console.log('Error:', error);
      throw new BadRequestException({
        message: 'Failed to add rating review',
      });
    }
  }
  async cancelOrder(id: number) {
    const order = await this.prisma.orders.findUnique({
      where: { id },
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    if (order.status === ORDER_STATUS.CANCELLED) {
      throw new BadRequestException('Order already cancelled');
    }
  }
  async getOrderHistory(session: TUserSession) {
    const orders = await this.prisma.orders.findMany({
      where: { user_id: session.id },
      include: {
        OrderDetails: {
          include: {
            book: true,
          },
        },
      },
    });
    return orders;
  }
  async getOrderState(id: number) {}
}
