import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { PrismaService } from '@module/prisma/prisma.service';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/library';
import { CreateOrderCommand } from './create-order.command';
import { OrderCreatedEvent } from '../events/order-created.event';
import { BookStatus, OrderStatus } from '@prisma/client';

@Injectable()
@CommandHandler(CreateOrderCommand)
export class CreateOrderHandler implements ICommandHandler<CreateOrderCommand> {
  private readonly logger = new Logger(CreateOrderHandler.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: CreateOrderCommand) {
    this.logger.log(`Creating order for user ${command.user?.id}`);

    const { user, dto } = command;

    return await this.prisma.$transaction(async (prisma) => {
      const orderItems = await Promise.all(
        dto.items.map(async (item) => {
          const book = await prisma.books.findUnique({
            where: { id: item.bookId, status: BookStatus.ACTIVE },
          });

          if (!book) {
            throw new BadRequestException(
              `Book with ID ${item.bookId} not found or inactive`,
            );
          }

          if (book.stock_quantity < item.quantity) {
            throw new BadRequestException(
              `Book "${book.title}" has insufficient stock. Available: ${book.stock_quantity}`,
            );
          }

          const unitPrice = book.price;
          const totalItemPrice = new Decimal(unitPrice).mul(item.quantity);

          await prisma.books.update({
            where: { id: book.id },
            data: { stock_quantity: { decrement: item.quantity } },
          });

          return {
            book_id: book.id,
            quantity: item.quantity,
            price: unitPrice,
            total_price: totalItemPrice,
          };
        }),
      );

      const subTotal = orderItems.reduce(
        (sum, item) => sum.add(item.total_price),
        new Decimal(0),
      );

      const order = await prisma.orders.create({
        data: {
          user: { connect: { id: user?.id } },
          address: dto.address,
          phone_number: dto.phoneNumber,
          full_name: dto.fullName,
          total_price: subTotal,
          payment_method: dto.paymentMethod,
          status: OrderStatus.PENDING,
          pending_at: new Date(),
          OrderItems: {
            create: orderItems.map((item) => ({
              book_id: item.book_id,
              quantity: item.quantity,
              price: item.price,
              total_price: item.total_price,
            })),
          },
        },
        include: {
          OrderItems: {
            include: {
              book: true,
            },
          },
          user: true,
        },
      });
      this.eventBus.publish(new OrderCreatedEvent(order));
      return order;
    });
  }
}
