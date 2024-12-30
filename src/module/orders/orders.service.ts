import {
  BadRequestException,
  HttpException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OrderPageOptionsDto } from './dto/find-all-orders.dto';
import { TUserSession } from 'src/common/decorators/user-session.decorator';
import { CreateOrderDto } from './dto/create-order.dto';
import { CreateReviewDto } from './dto/create-review.dto';
import { ORDER_STATUS, PAYMENT_METHOD, ReviewState } from 'src/utils/constants';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrderStatus, Role, TypeUser } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import * as axios from 'axios';
import * as qs from 'qs';
import * as moment from 'moment';
import { CreatePaymentUrlDto } from './dto/create-payment-url.dto';
import { Request, Response } from 'express';
import convertToUTC7 from 'src/utils/UTC7Transfer';
import { EmailService } from '../email/email.service';
import { sendSMS } from 'src/services/sms-gateway';
import { sortObject } from 'src/utils/vnpay.utils';
@Injectable()
export class OrderService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly emailService: EmailService,
  ) {}
  async createOrder(session: TUserSession, dto: CreateOrderDto) {
    const user = await this.prisma.users.findUnique({
      where: { id: session.id },
    });
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
        let order = null;
        if (dto.paymentMethod === PAYMENT_METHOD.COD) {
          const orderTemp = await tx.orders.create({
            data: {
              user: { connect: { id: session.id } },
              full_name: dto.fullName,
              phone_number: dto.phoneNumber,
              payment_method: dto.paymentMethod,
              address: dto.address,
              pending_at: convertToUTC7(new Date()),
              status: ORDER_STATUS.PROCESSING as OrderStatus,
              processing_at: convertToUTC7(new Date()),
            },
          });
          order = await tx.orders.findFirst({
            where: { id: orderTemp.id },
            include: {
              OrderItems: {
                include: {
                  book: true,
                },
              },
            },
          });
          await this.emailService.sendOrderProcessing({ user, order });
        } else {
          const orderTemp = await tx.orders.create({
            data: {
              user: { connect: { id: session.id } },
              full_name: dto.fullName,
              phone_number: dto.phoneNumber,
              payment_method: dto.paymentMethod,
              address: dto.address,
              pending_at: convertToUTC7(new Date()),
            },
          });
          order = orderTemp;
        }
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
          await tx.orders.update({
            where: { id },
            data: {
              status: dto.status,
              reject_at: convertToUTC7(new Date()),
              note: 'Bị hủy bởi người bán',
            },
          });
          const updatedOrder = await tx.orders.findUnique({
            where: { id },
            include: {
              OrderItems: {
                include: {
                  book: true,
                },
              },
              user: true,
            },
          });
          if (updatedOrder.user.email) {
            await this.emailService.sendOrderRejected({
              order: {
                ...updatedOrder,
                total_price: Number(updatedOrder.total_price),
                payment_method: PAYMENT_METHOD[updatedOrder.payment_method],
                OrderItems: updatedOrder.OrderItems.map((item) => ({
                  ...item,
                  Book: item.book,
                  price: Number(item.price),
                  total_price: Number(item.total_price),
                })),
              },
              user: updatedOrder.user,
            });
          }
          if (updatedOrder.user.phone) {
            await sendSMS({
              to: updatedOrder.user.phone,
              content: `Đơn hàng ${updatedOrder.id} của bạn đã bị từ chối. Vui lòng kiểm tra lại thông tin đơn hàng hoặc liên hệ với chúng tôi để được hỗ trợ!`,
            });
          }
          return updatedOrder;
        });
      } catch (error) {
        console.log(error);
        throw new BadRequestException('Failed to update order status');
      }
    } else if (dto.status === ORDER_STATUS.DELIVERED) {
      try {
        return await this.prisma.$transaction(async (tx) => {
          await tx.orders.update({
            where: { id },
            data: {
              status: dto.status,
              delivered_at: convertToUTC7(new Date()),
            },
          });
          const updatedOrder = await tx.orders.findUnique({
            where: { id },
            include: {
              OrderItems: {
                include: {
                  book: true,
                },
              },
              user: true,
            },
          });
          if (updatedOrder.user.email) {
            await this.emailService.sendOrderDelivering({
              order: {
                ...updatedOrder,
                total_price: Number(updatedOrder.total_price),
                payment_method: PAYMENT_METHOD[updatedOrder.payment_method],
                OrderItems: updatedOrder.OrderItems.map((item) => ({
                  ...item,
                  Book: item.book,
                  price: Number(item.price),
                  total_price: Number(item.total_price),
                })),
              },
              user: updatedOrder.user,
            });
          }
          if (updatedOrder.user.phone) {
            await sendSMS({
              to: updatedOrder.user.phone,
              content: `Đơn hàng ${updatedOrder.id} của bạn đã được giao cho đơn vị vận chuyển, dự kiến giao hàng trong 2 - 4 ngày tới, cảm ơn bạn đã đồng hành cùng BookNow!`,
            });
          }
          return updatedOrder;
        });
      } catch (error) {
        console.log(error);
        throw new BadRequestException('Failed to update order status');
      }
    } else if (
      dto.status === ORDER_STATUS.REJECT &&
      order.status === ORDER_STATUS.DELIVERED
    ) {
      try {
        return await this.prisma.$transaction(async (tx) => {
          await tx.orders.update({
            where: { id },
            data: {
              status: dto.status,
              reject_at: convertToUTC7(new Date()),
              note: 'Đơn hàng giao hàng không thành công',
            },
          });
          const updatedOrder = await tx.orders.findUnique({
            where: { id },
            include: {
              OrderItems: {
                include: {
                  book: true,
                },
              },
              user: true,
            },
          });
          if (updatedOrder.user.email) {
            await this.emailService.sendFailedOrder({
              order: {
                ...updatedOrder,
                total_price: Number(updatedOrder.total_price),
                payment_method: PAYMENT_METHOD[updatedOrder.payment_method],
                OrderItems: updatedOrder.OrderItems.map((item) => ({
                  ...item,
                  Book: item.book,
                  price: Number(item.price),
                  total_price: Number(item.total_price),
                })),
              },
              user: updatedOrder.user,
            });
          }
          if (updatedOrder.user.phone) {
            await sendSMS({
              to: updatedOrder.user.phone,
              content: `Đơn hàng ${updatedOrder.id} của bạn đã giao không thành công do có sự cố hoặc vì lý do gì khác, vui lòng tra cứu kỹ hơn tại website của BookNow!`,
            });
          }
          return updatedOrder;
        });
      } catch (error) {
        console.log(error);
        throw new BadRequestException(error.message);
      }
    } else if (dto.status === ORDER_STATUS.SUCCESS) {
      try {
        return await this.prisma.$transaction(async (tx) => {
          await tx.orders.update({
            where: { id },
            data: {
              status: dto.status,
              success_at: convertToUTC7(new Date()),
            },
          });
          const updatedOrder = await tx.orders.findUnique({
            where: { id },
            include: {
              OrderItems: {
                include: {
                  book: true,
                },
              },
              user: true,
            },
          });
          if (updatedOrder.user.email) {
            await this.emailService.sendOrderSuccess({
              order: {
                ...updatedOrder,
                total_price: Number(updatedOrder.total_price),
                payment_method: PAYMENT_METHOD[updatedOrder.payment_method],
                OrderItems: updatedOrder.OrderItems.map((item) => ({
                  ...item,
                  Book: item.book,
                  price: Number(item.price),
                  total_price: Number(item.total_price),
                })),
              },
              user: updatedOrder.user,
            });
          }
          if (updatedOrder.user.phone) {
            await sendSMS({
              to: updatedOrder.user.phone,
              content: `Đơn hàng ${updatedOrder.id} của bạn đã được giao thành công. Cảm ơn bạn đã mua hàng tại BookNow!`,
            });
          }
          return updatedOrder;
        });
      } catch (error) {
        console.log(error);
        throw new BadRequestException('Failed to update order status');
      }
    }
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
        message: error.message,
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
          data: {
            status: ORDER_STATUS.CANCELLED as OrderStatus,
            cancelled_at: convertToUTC7(new Date()),
            note: 'Hủy bởi người mua',
          },
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
      const response = await axios.default(options);
      await this.prisma.orders.update({
        where: {
          id: dto.orderId,
        },
        data: {
          payment_url: response.data.payUrl,
        },
      });
      return response.data;
    } catch (error) {
      console.log('Error:', error);
      throw new BadRequestException('Failed to create payment url');
    }
  }
  async callbackWithMomo(req: Request, res: Response) {
    try {
      // check signature sẽ implement sau, tạm thời bỏ qua bước này
      const { orderId, resultCode } = req.body;
      //update order status and send email, sms
      if (resultCode === 0) {
        await this.prisma.orders.update({
          where: { id: orderId as string },
          data: {
            status: ORDER_STATUS.PROCESSING as OrderStatus,
            processing_at: convertToUTC7(new Date()),
            is_paid: true,
          },
        });
        const order = await this.prisma.orders.findUnique({
          where: { id: orderId },
          include: {
            OrderItems: {
              include: {
                book: true,
              },
            },
          },
        });
        const user = await this.prisma.users.findUnique({
          where: { id: order.user_id },
        });
        // send email, sms
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
          user,
        });
        await sendSMS({
          to: user.phone,
          content: `Đơn hàng ${order.id} của bạn đã được thanh toán và đang được xử lý. Cảm ơn bạn đã mua hàng tại BookNow!`,
        });
        return res.status(204).json({
          resultCode: 0,
          message: 'Success',
        });
      } else {
        return res.status(204).json({
          resultCode: 10,
          message: 'Failed',
        });
      }
    } catch (error) {
      console.log('Error:', error);
      const response = {
        resultCode: 10,
        message: 'Error',
      };
      return res.status(204).json(response);
    }
  }

  async validatePaymentWithMomo(query: any) {
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
      const response = await axios.default(options);
      return response.data;
    } catch (error) {
      console.log('Error:', error);
      throw new BadRequestException('Failed to validate payment');
    }
  }

  async createPaymentUrlWithVNPay(dto: CreatePaymentUrlDto, req: Request) {
    try {
      const order = await this.prisma.orders.findUniqueOrThrow({
        where: { id: dto.orderId },
      });
      process.env.TZ = 'Asia/Ho_Chi_Minh';
      const date = new Date();
      const vnpCreateDate = moment(date).format('YYYYMMDDHHmmss');
      const vnpIpAddr =
        req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.socket.remoteAddress;

      const vnpReturnurl = this.config.get<string>('redirect_url_payment');
      let vnpUrl = this.config.get<string>('vnpay_url');
      const vnpTmnCode = this.config.get<string>('vnpay_tmn_code');
      const vnpHashSecret = this.config.get<string>('vnpay_hash_secret');
      const orderId = order.id;
      // const vnpIpAddr = this.config.get<string>('ipAddress');
      const vnpAmount = Number(order.total_price) * 100;
      const vnpOrderInfo = 'Thanh toán đơn hàng ' + order.id;
      const vnpTxnRef = orderId;

      const expireDate = new Date(new Date().getTime() + 15 * 60 * 1000);
      const vnpExpireDate = moment(expireDate).format('YYYYMMDDHHmmss');
      let vnp_Params = {};
      vnp_Params['vnp_Version'] = '2.1.0';
      vnp_Params['vnp_Command'] = 'pay';
      vnp_Params['vnp_TmnCode'] = vnpTmnCode;
      // vnp_Params['vnp_Merchant'] = ''
      vnp_Params['vnp_Locale'] = 'vn';
      vnp_Params['vnp_CurrCode'] = 'VND';
      vnp_Params['vnp_TxnRef'] = vnpTxnRef;
      vnp_Params['vnp_OrderInfo'] = vnpOrderInfo;
      vnp_Params['vnp_Amount'] = vnpAmount;
      vnp_Params['vnp_ReturnUrl'] = vnpReturnurl;
      vnp_Params['vnp_IpAddr'] = vnpIpAddr;
      vnp_Params['vnp_CreateDate'] = vnpCreateDate;
      vnp_Params['vnp_OrderType'] = 'other';
      vnp_Params['vnp_ExpireDate'] = vnpExpireDate;
      vnp_Params = sortObject(vnp_Params);
      const signData: string = qs.stringify(vnp_Params, { encode: false });
      const hmac = crypto.createHmac('sha512', vnpHashSecret);
      const signed: string = hmac
        .update(Buffer.from(signData, 'utf-8'))
        .digest('hex');
      vnp_Params['vnp_SecureHash'] = signed;
      vnpUrl += '?' + qs.stringify(vnp_Params, { encode: false });
      return vnpUrl;
    } catch (error) {
      console.log(error);
      throw new HttpException(error.message, 500);
    }
  }
  async callbackWithVNPay(req: Request, res: Response) {
    try {
      let vnp_Params = req.query;
      const secureHash = vnp_Params['vnp_SecureHash'];
      const orderId = vnp_Params['vnp_TxnRef'];
      const rspCode = vnp_Params['vnp_ResponseCode'];

      delete vnp_Params['vnp_SecureHash'];
      delete vnp_Params['vnp_SecureHashType'];

      vnp_Params = sortObject(vnp_Params);
      const vnpHashSecret = this.config.get<string>('vnpay_hash_secret');
      const signData = qs.stringify(vnp_Params, { encode: false });
      const hmac = crypto.createHmac('sha512', vnpHashSecret);
      const signed = hmac.update(new Buffer(signData, 'utf-8')).digest('hex');

      const paymentStatus = '0';
      let checkOrderId = true;
      const order = await this.prisma.orders.findUniqueOrThrow({
        where: { id: orderId as string },
      });
      if (!order) {
        checkOrderId = false;
      }
      const checkAmount =
        Math.abs(
          Number(order.total_price) - Number(vnp_Params['vnp_Amount']) / 100,
        ) < 0.01;
      if (secureHash === signed) {
        console.log('Checksum success');
        if (checkOrderId) {
          console.log('Order found');
          if (checkAmount) {
            console.log('Amount valid');
            if (paymentStatus == '0') {
              console.log('Payment success');
              if (rspCode == '00') {
                console.log('Payment success');
                const user = await this.prisma.users.findUnique({
                  where: { id: order.user_id },
                });
                await this.prisma.orders.update({
                  where: { id: orderId as string },
                  data: {
                    status: ORDER_STATUS.PROCESSING as OrderStatus,
                    processing_at: convertToUTC7(new Date()),
                    is_paid: true,
                  },
                });
                const newOrder = await this.prisma.orders.findUnique({
                  where: { id: orderId as string },
                  include: {
                    OrderItems: {
                      include: {
                        book: true,
                      },
                    },
                  },
                });
                await this.emailService.sendOrderProcessing({
                  order: {
                    ...newOrder,
                    total_price: Number(newOrder.total_price),
                    payment_method: PAYMENT_METHOD[newOrder.payment_method],
                    OrderItems: newOrder.OrderItems.map((item) => ({
                      ...item,
                      Book: item.book,
                      price: Number(item.price),
                      total_price: Number(item.total_price),
                    })),
                  },
                  user,
                });
                await sendSMS({
                  to: user.phone,
                  content: `Đơn hàng ${order.id} của bạn đã được thanh toán và đang được xử lý. Cảm ơn bạn đã mua hàng tại BookNow!`,
                });

                res.status(200).json({ RspCode: '00', Message: 'Success' });
              } else {
                res.status(200).json({ RspCode: '00', Message: 'Success' });
              }
            } else {
              res.status(200).json({
                RspCode: '02',
                Message: 'This order has been updated to the payment status',
              });
            }
          } else {
            res.status(200).json({ RspCode: '04', Message: 'Amount invalid' });
          }
        } else {
          res.status(200).json({ RspCode: '01', Message: 'Order not found' });
        }
      } else {
        res.status(200).json({ RspCode: '97', Message: 'Checksum failed' });
      }
    } catch (error) {
      console.log('Error:', error);
      res.status(200).json({ RspCode: '97', Message: 'Checksum failed' });
    }
  }
  async validatePaymentWithVNPay(query: any) {
    try {
      let vnp_Params = query;
      const secureHash = vnp_Params['vnp_SecureHash'];
      delete vnp_Params['vnp_SecureHash'];
      delete vnp_Params['vnp_SecureHashType'];
      vnp_Params = sortObject(vnp_Params);
      const vnpHashSecret = this.config.get<string>('vnpHashSecret');
      const signData = qs.stringify(vnp_Params, { encode: false });
      const hmac = crypto.createHmac('sha512', vnpHashSecret);
      const signed = hmac.update(new Buffer(signData, 'utf-8')).digest('hex');
      if (secureHash === signed) {
        return {
          message: 'Success',
          code: vnp_Params['vnp_ResponseCode'],
        };
      } else {
        return { message: 'Pay fail', code: '97' };
      }
    } catch (error) {
      console.log('Error:', error);
      throw new BadRequestException('Failed to validate payment with VNPay');
    }
  }

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
      const callback_url = this.config.get<string>('ipn_url_zalopay');
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
        callback_url: callback_url,
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
      await this.prisma.orders.update({
        where: { id: order.id },
        data: { payment_url: response.data.order_url },
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
        const items = JSON.parse(dataJson['item']);
        const orderId = items[0].itemid;
        const order = await this.prisma.orders.findUnique({
          where: { id: orderId as string },
        });
        await this.prisma.orders.update({
          where: { id: orderId as string },
          data: {
            status: ORDER_STATUS.PROCESSING as OrderStatus,
            processing_at: convertToUTC7(new Date()),
            is_paid: true,
          },
        });
        const newOrder = await this.prisma.orders.findUnique({
          where: { id: orderId as string },
          include: {
            OrderItems: {
              include: {
                book: true,
              },
            },
          },
        });
        const user = await this.prisma.users.findUnique({
          where: { id: order.user_id },
        });
        await this.emailService.sendOrderProcessing({
          order: {
            ...newOrder,
            total_price: Number(newOrder.total_price),
            payment_method: PAYMENT_METHOD[newOrder.payment_method],
            OrderItems: newOrder.OrderItems.map((item) => ({
              ...item,
              Book: item.book,
              price: Number(item.price),
              total_price: Number(item.total_price),
            })),
          },
          user,
        });
        await sendSMS({
          to: user.phone,
          content: `Đơn hàng ${order.id} của bạn đã được thanh toán và đang được xử lý. Cảm ơn bạn đã mua hàng tại BookNow!`,
        });
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

  async anonymousCheckout(dto: CreateOrderDto) {
    try {
      const newUser = await this.prisma.users.create({
        data: {
          full_name: dto.fullName,
          phone: dto.phoneNumber,
          type_user: TypeUser.POTENTIAL_CUSTOMER,
          role: Role.CUSTOMER,
          password: '123456',
        },
      });
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
          let order = null;
          if (dto.paymentMethod === PAYMENT_METHOD.COD) {
            const orderTemp = await tx.orders.create({
              data: {
                user: { connect: { id: newUser.id } },
                full_name: dto.fullName,
                phone_number: dto.phoneNumber,
                payment_method: dto.paymentMethod,
                address: dto.address,
                pending_at: convertToUTC7(new Date()),
                status: ORDER_STATUS.PROCESSING as OrderStatus,
                processing_at: convertToUTC7(new Date()),
              },
            });
            order = await tx.orders.findFirst({
              where: { id: orderTemp.id },
              include: {
                OrderItems: {
                  include: {
                    book: true,
                  },
                },
              },
            });
            if (newUser.email) {
              await this.emailService.sendOrderProcessing({
                user: newUser,
                order,
              });
            }
          } else {
            const orderTemp = await tx.orders.create({
              data: {
                user: { connect: { id: newUser.id } },
                full_name: dto.fullName,
                phone_number: dto.phoneNumber,
                payment_method: dto.paymentMethod,
                address: dto.address,
                pending_at: convertToUTC7(new Date()),
              },
            });
            order = orderTemp;
          }
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
    } catch (error) {
      throw new HttpException(error.message, 500);
    }
  }
}
