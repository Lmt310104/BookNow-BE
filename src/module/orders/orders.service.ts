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
import { ORDER_STATUS, ReviewState } from 'src/utils/constants';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrderStatus } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import * as axios from 'axios';
import * as qs from 'qs';
import * as moment from 'moment';
import { CreatePaymentUrlDto } from './dto/create-payment-url.dto';
import { Request } from 'express';
@Injectable()
export class OrderService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}
  async createOrder(session: TUserSession, dto: CreateOrderDto) {
    const bookIds = dto.items.map((item) => item.bookId);
    const books = await this.prisma.books.findMany({
      where: { id: { in: bookIds } },
    });
    const cart = await this.prisma.carts.findFirstOrThrow({
      where: { user_id: session.id },
    });
    const cartItems = await this.prisma.cartItems.findMany({
      where: { cart_id: cart.id, book_id: { in: bookIds } },
    });
    const cartItemIds = cartItems.map((item) => item.id);
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
        await tx.cartItems.deleteMany({
          where: {
            id: { in: cartItemIds },
          },
        });
        const order = await tx.orders.create({
          data: {
            user: { connect: { id: session.id } },
            full_name: dto.fullName,
            phone_number: dto.phoneNumber,
            payment_method: dto.paymentMethod,
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
        await tx.orderItems.createMany({ data: orderItems });
        await Promise.all(
          orderItems.map((item) =>
            tx.books.update({
              where: { id: item.book_id },
              data: {
                stock_quantity: { decrement: item.quantity },
                sold_quantity: { increment: item.quantity },
              },
            }),
          ),
        );
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
            OrderItems: {
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
      where: {
        ...(query.status && { status: query.status }),
        ...(query.search && {
          id: { contains: query.search, mode: 'insensitive' },
        }),
      },
      skip: query.skip,
      take: take,
      orderBy: { [sortBy]: order },
      include: {
        OrderItems: {
          include: {
            book: true,
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            full_name: true,
          },
        },
      },
    });
    const itemCount = await this.prisma.orders.count({
      where: {
        ...(query.status && { status: query.status }),
        ...(query.search && {
          id: { contains: query.search, mode: 'insensitive' },
        }),
      },
    });
    return { orders, itemCount };
  }
  async getOrderProductsByUser(id: string, session: TUserSession) {
    const order = await this.prisma.orders.findUnique({
      where: { user_id: session.id, id: id },
      include: {
        OrderItems: {
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
      where: {
        user_id: session.id,
        ...(query.status && { status: query.status }),
        ...(query.search && {
          id: { contains: query.search, mode: 'insensitive' },
        }),
      },
      skip: query.skip,
      take: take,
      orderBy: { [sortBy]: order },
      include: {
        OrderItems: {
          include: {
            book: true,
          },
        },
      },
    });
    const itemCount = await this.prisma.orders.count({
      where: {
        user_id: session.id,
        ...(query.status && { status: query.status }),
        ...(query.search && {
          id: { contains: query.search, mode: 'insensitive' },
        }),
      },
    });
    return { orders, itemCount };
  }
  async updateOrderStatus(id: string, dto: UpdateOrderStatusDto) {
    const order = await this.prisma.orders.findUnique({
      where: { id },
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    if (
      order.status === ORDER_STATUS.CANCELLED ||
      order.status === ORDER_STATUS.REJECT
    ) {
      throw new BadRequestException('Order already cancelled or rejected');
    }
    if (dto.status === ORDER_STATUS.REJECT) {
      try {
        return await this.prisma.$transaction(async (tx) => {
          const updatedOrder = await tx.orders.update({
            where: { id },
            data: { status: dto.status },
          });
          return updatedOrder;
        });
      } catch (error) {
        console.log(error);
        throw new BadRequestException('Failed to update order status');
      }
    }
    return await this.prisma.orders.update({
      where: { id },
      data: { status: dto.status },
    });
  }
  async createReview(
    session: TUserSession,
    dto: CreateReviewDto,
    id: string,
    orderDetailId: string,
    bookId: string,
  ) {
    const order = await this.prisma.orders.findUnique({
      where: { user_id: session.id, id },
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    const orderDetail = await this.prisma.orderItems.findUnique({
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
        const review = await tx.reviews.create({
          data: {
            user_id: session.id,
            book_id: book.id,
            rating: dto.star,
            description: dto.description,
            title: dto.title,
            order_item_id: orderDetailId,
          },
          include: {
            book: true,
          },
        });
        await tx.books.update({
          where: { id: book.id },
          data: {
            total_reviews: newTotalReviews,
            avg_stars: newAvgStars,
          },
        });
        await tx.orderItems.update({
          where: { id: orderDetailId },
          data: { review_status: ReviewState.REVIEWED, review_id: review.id },
        });
        const orderItems = await tx.orderItems.findMany({
          where: { order_id: id },
        });
        let flag = true;
        for (const item of orderItems) {
          if (item.review_status !== ReviewState.REVIEWED) {
            flag = false;
            break;
          }
        }
        if (flag) {
          await tx.orders.update({
            where: { id },
            data: { review_state: ReviewState.REVIEWED },
          });
        }
        return review;
      });
    } catch (error) {
      console.log('Error:', error);
      throw new BadRequestException({
        message: 'Failed to add rating review',
      });
    }
  }
  async cancelOrder(id: string, session: TUserSession) {
    const order = await this.prisma.orders.findUnique({
      where: { id: id, user_id: session.id },
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    if (order.status === ORDER_STATUS.CANCELLED) {
      throw new BadRequestException('Order already cancelled');
    }
    const orderDetails = await this.prisma.orderItems.findMany({
      where: { order_id: id },
    });
    const bookIds = orderDetails.map((item) => {
      return { id: item.book_id, quantity: item.quantity };
    });
    try {
      return await this.prisma.$transaction(async (tx) => {
        await tx.orders.update({
          where: { id },
          data: { status: ORDER_STATUS.CANCELLED as OrderStatus },
        });
        bookIds.forEach(async (item) => {
          await tx.books.update({
            where: { id: item.id },
            data: {
              stock_quantity: { increment: item.quantity },
            },
          });
        });
        return await tx.orders.findUnique({
          where: { id },
        });
      });
    } catch (error) {
      console.log('Error:', error);
      throw new BadRequestException('Failed to cancel order');
    }
  }
  async getOrderDetailsByAdmin(id: string) {
    const order = await this.prisma.orders.findUnique({
      where: {
        id: id,
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
    if (!order) {
      throw new BadRequestException('Order not found');
    }
    return order;
  }
  async getOrderHistory(session: TUserSession, dto: OrderPageOptionsDto) {
    const orders = await this.prisma.orders.findMany({
      where: { user_id: session.id, ...(dto.status && { status: dto.status }) },
      include: {
        OrderItems: {
          include: {
            book: true,
          },
        },
      },
      take: dto.take,
      skip: dto.skip,
      orderBy: { [dto.sortBy]: dto.order },
    });
    const itemCount = await this.prisma.orders.count({
      where: { user_id: session.id, ...(dto.status && { status: dto.status }) },
    });
    return { orders, itemCount };
  }
  async createPaymentUrlWithMomo(
    session: TUserSession,
    dto: CreatePaymentUrlDto,
  ) {
    try {
      const order = await this.prisma.orders.findUniqueOrThrow({
        where: { id: dto.orderId, user_id: session.id },
      });
      const partnerCodeMomo = this.config.get<string>('partner_code_momo');
      const accessKeyMomo = this.config.get<string>('access_key_momo');
      const secretKeyMomo = this.config.get<string>('secret_key_momo');
      const orderInfo = `Thanh toán đơn hàng ${order.id}`;
      const redirectUrl = this.config.get<string>('redirect_url_payment');
      const ipnUrl = this.config.get<string>('ipn_url_momo');
      const requestId = partnerCodeMomo + new Date().getTime();
      const orderId = requestId;
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
        url: 'https://test-payment.momo.vn/v2/gateway/api/create', // Dùng URL đầy đủ
        data: requestBody,
      };
      const response = await axios.default(options);
      return response.data;
    } catch (error) {
      console.log('Error:', error);
      throw new BadRequestException('Failed to create payment url');
    }
  }
  async callbackWithMomo(query: any) {}

  async validatePayment(query: any) {
    try {
    } catch (error) {
      console.log('Error:', error);
      throw new BadRequestException('Failed to validate payment');
    }
  }

  async createPaymentUrlWithVNPay() {}
  async callbackWithVNPay() {}
  async validatePaymentWithVNPay() {}

  async createPaymentUrlWithZaloPay(
    body: CreatePaymentUrlDto,
    user: TUserSession,
  ) {
    try {
      const order = await this.prisma.orders.findUniqueOrThrow({
        where: { id: body.orderId, user_id: user.id },
      });
      const config = {
        app_id: this.config.get<string>('app_id_zalopay'),
        key1: this.config.get<string>('key1_zalopay'),
        key2: this.config.get<string>('key2_zalopay'),
        endpoint: this.config.get<string>('endpoint_zalopay'),
      };
      const embed_data = {
        redirecturl: this.config.get<string>('redirect_url_payment'),
      };
      const items = [
        {
          itemid: order.id,
          itemname: `${order.id}_${order.full_name}_${order.phone_number}_${order.address}`,
          itemprice: order.total_price,
          itemquantity: 1,
        },
      ];
      const transID = Math.floor(Math.random() * 1000000);

      const orderData = {
        app_id: config.app_id,
        app_trans_id: `${moment().format('YYMMDD')}_${transID}`,
        app_user: user.id,
        app_time: Date.now(),
        bank_code: '',
        item: JSON.stringify(items),
        embed_data: JSON.stringify(embed_data),
        amount: Number(order.total_price),
        callback_url: this.config.get<string>('ipn_url_zalopay'),
        description: 'Thanh toán đơn hàng',
        mac: '',
      };
      const data =
        config.app_id +
        '|' +
        orderData.app_trans_id +
        '|' +
        orderData.app_user +
        '|' +
        orderData.amount +
        '|' +
        orderData.app_time +
        '|' +
        orderData.embed_data +
        '|' +
        orderData.item;
      orderData.mac = crypto
        .createHmac('sha256', config.key1)
        .update(data)
        .digest('hex');
      console.log(orderData);
      const response = await axios.default.post(config.endpoint, null, {
        params: orderData,
      });
      return response.data;
    } catch (error) {
      console.log('Error:', error);
      throw new BadRequestException('Failed to create payment url');
    }
  }
  async callbackWithZaloPay(req: Request) {
    try {
      const result = {
        return_code: 1,
        return_message: 'Success',
      };
      const dataStr = req.body.data;
      const reqMac = req.body.mac;
      const key2 = this.config.get('key2_zalopay');
      const mac = crypto
        .createHmac('sha256', key2)
        .update(dataStr)
        .digest('hex');
      if (reqMac !== mac) {
        result.return_code = -1;
        result.return_message = 'mac not equal';
      } else {
        console.log('data:', dataStr);
        const dataJson = JSON.parse(dataStr, key2);
        console.log(
          "update order's status = success where app_trans_id =",
          dataJson['app_trans_id'],
        );
        result.return_code = 1;
        result.return_message = 'Success';
      }
      return result;
    } catch (error) {
      console.log('Error:', error);
      return {
        return_code: -1,
        return_message: 'Error',
      };
    }
  }
  async getPaymentStatusWithZaloPay(query: any) {
    try {
      const config = {
        app_id: this.config.get<string>('app_id_zalopay'),
        key1: this.config.get<string>('key1_zalopay'),
        key2: this.config.get<string>('key2_zalopay'),
        endpoint: 'https://sb-openapi.zalopay.vn/v2/query',
      };
      const postData = {
        app_id: config.app_id,
        app_trans_id: query.app_trans_id,
        mac: '',
      };
      const data =
        postData.app_id + '|' + postData.app_trans_id + '|' + config.key1;
      postData.mac = crypto
        .createHmac('sha256', config.key1)
        .update(data)
        .digest('hex');
      const postConfig = {
        method: 'post',
        url: config.endpoint,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        data: qs.stringify(postData),
      };

      console.log('postConfig:', postConfig);
      const response = await axios.default(postConfig);
      return response.data;
    } catch (error) {
      console.log('Error:', error);
      throw new BadRequestException('Failed to get payment status');
    }
  }
}
