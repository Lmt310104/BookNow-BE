import { Injectable } from '@nestjs/common';
import { PaymentStrategy } from './interface/payment.strategy';

@Injectable()
export class PaymentContext {
  private strategy: PaymentStrategy;

  setStrategy(strategy: any) {
    this.strategy = strategy;
  }

  async createPaymentUrl(dto: any, req?: any) {
    if (!this.strategy || !this.strategy.createPaymentUrl) {
      throw new Error(
        'Payment strategy not set or does not implement createPaymentUrl',
      );
    }
    return this.strategy.createPaymentUrl(dto, req);
  }

  async processCallback(data: any) {
    if (!this.strategy || !this.strategy.processCallback) {
      throw new Error(
        'Payment strategy not set or does not implement processCallback',
      );
    }
    return this.strategy.processCallback(data);
  }

  async validatePayment(query: any) {
    if (!this.strategy || !this.strategy.validatePayment) {
      throw new Error(
        'Payment strategy not set or does not implement validatePayment',
      );
    }
    return this.strategy.validatePayment(query);
  }
}
