import { Request } from 'express';
import { CreatePaymentUrlDto } from '@module/orders/dto/create-payment-url.dto';

export interface PaymentStrategyResult {
  paymentUrl: string;
  redirectUrl?: string;
  transactionId?: string;
  extraData?: any;
}

export interface PaymentStrategy {
  createPaymentUrl(
    dto: CreatePaymentUrlDto,
    req?: Request,
  ): Promise<PaymentStrategyResult>;
  processCallback(data: any): Promise<{
    success: boolean;
    orderId?: string;
    message: string;
    data?: any;
  }>;
  validatePayment(query: any): Promise<{
    success: boolean;
    message: string;
    data?: any;
  }>;
}
