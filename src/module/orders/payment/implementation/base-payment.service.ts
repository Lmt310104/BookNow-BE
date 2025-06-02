import { Injectable } from '@nestjs/common';
import { PrismaService } from '@module/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '@module/email/email.service';
import {
  PaymentStrategy,
  PaymentStrategyResult,
} from '../interface/payment.strategy';
import { CreatePaymentUrlDto } from '@module/orders/dto/create-payment-url.dto';
import { Request } from 'express';
import { OrderStatus } from '@prisma/client';
import { ORDER_STATUS, PAYMENT_METHOD } from 'src/utils/constants';
import sendSMS from 'src/services/sms-gateway';

@Injectable()
export abstract class BasePaymentService implements PaymentStrategy {
  constructor(
    protected readonly prisma: PrismaService,
    protected readonly config: ConfigService,
    protected readonly emailService: EmailService,
  ) {}

  abstract createPaymentUrl(
    dto: CreatePaymentUrlDto,
    req?: Request,
  ): Promise<PaymentStrategyResult>;
  abstract processCallback(data: any): Promise<{
    success: boolean;
    orderId?: string;
    message: string;
    data?: any;
  }>;
  abstract validatePayment(
    query: any,
  ): Promise<{ success: boolean; message: string; data?: any }>;

  protected async getOrderForPayment(orderId: string) {
    return this.prisma.orders.findUniqueOrThrow({
      where: { id: orderId },
      include: {
        user: true,
      },
    });
  }

  protected async updateOrderAfterSuccessPayment(orderId: string) {
    const order = await this.prisma.orders.update({
      where: { id: orderId },
      data: {
        status: ORDER_STATUS.PROCESSING as OrderStatus,
        processing_at: new Date(),
        is_paid: true,
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

    if (order.user?.email) {
      await this.emailService.sendOrderProcessing({
        order: {
          ...order,
          total_price: Number(order.total_price),
          payment_method: PAYMENT_METHOD[order.payment_method],
          OrderItems: order.OrderItems.map((item) => ({
            ...item,
            Book: item.book,
            price: Number(item.price),
            total_price: Number(item.total_price),
          })),
        },
        user: order.user,
      });
    }
    if (order.phone_number) {
      await sendSMS({
        to: order.phone_number,
        content: `BookNow cảm ơn! Đơn hàng ${order.id} của bạn đã được thanh toán và đang được xử lý, tổng tiền ${order.total_price}.`,
      });
    }

    return order;
  }

  protected async updatePaymentUrl(orderId: string, paymentUrl: string) {
    return this.prisma.orders.update({
      where: { id: orderId },
      data: { payment_url: paymentUrl },
    });
  }
}
