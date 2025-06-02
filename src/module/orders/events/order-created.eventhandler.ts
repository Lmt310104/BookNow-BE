import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { EmailService } from '@module/email/email.service';
import { PAYMENT_METHOD } from 'src/utils/constants';
import { OrderCreatedEvent } from './order-created.event';

@EventsHandler(OrderCreatedEvent)
export class OrderCreatedHandler implements IEventHandler<OrderCreatedEvent> {
  private readonly logger = new Logger(OrderCreatedHandler.name);

  constructor(private readonly emailService: EmailService) {}

  async handle(event: OrderCreatedEvent) {
    this.logger.log(`Order created: ${event.order.id}`);

    try {
      if (event.order.user?.email) {
        await this.emailService.sendOrderProcessing({
          order: {
            ...event.order,
            total_price: Number(event.order.total_price),
            payment_method: PAYMENT_METHOD[event.order.payment_method],
            OrderItems: event.order.OrderItems.map((item) => ({
              ...item,
              Book: item.book,
              price: Number(item.price),
              total_price: Number(item.total_price),
            })),
          },
          user: event.order.user,
        });

        this.logger.log(`Confirmation email sent to ${event.order.user.email}`);
      }
    } catch (error) {
      this.logger.error(
        `Failed to process order created event: ${error.message}`,
      );
    }
  }
}
