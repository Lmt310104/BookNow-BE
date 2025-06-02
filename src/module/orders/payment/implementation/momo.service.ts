import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { BasePaymentService } from './base-payment.service';
import { CreatePaymentUrlDto } from '@module/orders/dto/create-payment-url.dto';
import * as crypto from 'crypto';
import axios from 'axios';
import { PaymentStrategyResult } from '../interface/payment.strategy';

@Injectable()
export class MomoPaymentService extends BasePaymentService {
  private readonly logger = new Logger(MomoPaymentService.name);

  async createPaymentUrl(
    dto: CreatePaymentUrlDto,
  ): Promise<PaymentStrategyResult> {
    try {
      const order = await this.getOrderForPayment(dto.orderId);

      const partnerCodeMomo = this.config.get<string>('partner_code_momo');
      const accessKeyMomo = this.config.get<string>('access_key_momo');
      const secretKeyMomo = this.config.get<string>('secret_key_momo');
      const orderInfo = `Thanh toán đơn hàng ${order.id}`;
      const redirectUrl = this.config.get<string>('redirect_url_payment');
      const ipnUrl = this.config.get<string>('ipn_url_momo');
      const requestId = partnerCodeMomo + new Date().getTime();
      const orderId = dto.orderId;
      const amount = Number(order.total_price);
      const requestType = 'captureWallet';
      const extraData = 'bookstore';

      const rawSignature =
        'accessKey=' +
        accessKeyMomo +
        '&amount=' +
        amount +
        '&extraData=' +
        extraData +
        '&ipnUrl=' +
        ipnUrl +
        '&orderId=' +
        orderId +
        '&orderInfo=' +
        orderInfo +
        '&partnerCode=' +
        partnerCodeMomo +
        '&redirectUrl=' +
        redirectUrl +
        '&requestId=' +
        requestId +
        '&requestType=' +
        requestType;

      const signature = crypto
        .createHmac('sha256', secretKeyMomo)
        .update(rawSignature)
        .digest('hex');

      const requestBody = JSON.stringify({
        partnerCode: partnerCodeMomo,
        accessKey: accessKeyMomo,
        requestId: requestId,
        amount: amount,
        orderId: orderId,
        orderInfo: orderInfo,
        redirectUrl: redirectUrl,
        ipnUrl: ipnUrl,
        extraData: extraData,
        requestType: requestType,
        signature: signature,
        lang: 'en',
      });

      const options = {
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(requestBody, 'utf8'),
        },
        method: 'POST',
        url: 'https://test-payment.momo.vn/v2/gateway/api/create',
        data: requestBody,
      };

      const response = await axios(options);
      await this.updatePaymentUrl(dto.orderId, response.data.payUrl);

      return {
        paymentUrl: response.data.payUrl,
        transactionId: requestId,
        extraData: response.data,
      };
    } catch (error) {
      this.logger.error(`Error creating Momo payment URL: ${error.message}`);
      throw new BadRequestException('Failed to create MoMo payment URL');
    }
  }

  async processCallback(data: any): Promise<{
    success: boolean;
    orderId?: string;
    message: string;
    data?: any;
  }> {
    try {
      const { orderId, resultCode } = data;

      if (resultCode === 0) {
        await this.updateOrderAfterSuccessPayment(orderId);
        return {
          success: true,
          orderId,
          message: 'Payment successful',
          data,
        };
      } else {
        return {
          success: false,
          orderId,
          message: 'Payment failed',
          data,
        };
      }
    } catch (error) {
      this.logger.error(`Error processing MoMo callback: ${error.message}`);
      return {
        success: false,
        message: 'Error processing payment callback',
        data,
      };
    }
  }

  async validatePayment(
    query: any,
  ): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      const partnerCodeMomo = this.config.get<string>('partner_code_momo');
      const accessKeyMomo = this.config.get<string>('access_key_momo');
      const orderId = query.orderId;
      const requestId = partnerCodeMomo + new Date().getTime();
      const secretKeyMomo = this.config.get<string>('secret_key_momo');
      const lang = 'en';

      const data = `accessKey=${accessKeyMomo}&orderId=${orderId}&partnerCode=${partnerCodeMomo}&requestId=${requestId}`;
      const signature = crypto
        .createHmac('sha256', secretKeyMomo)
        .update(data)
        .digest('hex');

      const options = {
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
        url: 'https://test-payment.momo.vn/v2/gateway/api/query',
        data: JSON.stringify({
          partnerCode: partnerCodeMomo,
          requestId: requestId,
          orderId: orderId,
          signature: signature,
          lang: lang,
        }),
      };

      const response = await axios(options);

      return {
        success: response.data.resultCode === 0,
        message: response.data.message,
        data: response.data,
      };
    } catch (error) {
      this.logger.error(`Error validating MoMo payment: ${error.message}`);
      return {
        success: false,
        message: 'Failed to validate payment',
      };
    }
  }
}
