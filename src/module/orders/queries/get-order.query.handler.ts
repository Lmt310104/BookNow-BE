import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '@module/prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { GetOrderQuery } from './get-order.query';

@QueryHandler(GetOrderQuery)
export class GetOrderHandler implements IQueryHandler<GetOrderQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetOrderQuery) {
    const order = await this.prisma.orders.findUnique({
      where: { id: query.orderId },
      include: {
        OrderItems: {
          include: {
            book: true,
          },
        },
        user: true,
      },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${query.orderId} not found`);
    }

    return order;
  }
}