import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { OrderStatus } from '@prisma/client';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GeminiService } from '../gemini/gemini.service';
@Injectable()
export class WebhookService {
  constructor(
    private readonly prisma: PrismaService,
    private geminiService: GeminiService,
    private readonly configService: ConfigService,
  ) {}
  async searchBook(req: Request) {
    try {
      const { sessionInfo } = req.body;
      const { parameters } = sessionInfo;
      const { bookname, bookauthor, bookcategory } = parameters;
      console.log(bookname, bookauthor);
      const books = await this.prisma.books.findMany({
        where: {
          ...(bookname && {
            title: {
              contains: bookname,
              mode: 'insensitive',
            },
          }),
          ...(bookauthor && {
            author: {
              contains: bookauthor,
              mode: 'insensitive',
            },
          }),
          ...(bookcategory && {
            Category: {
              name: {
                contains: bookcategory,
                mode: 'insensitive',
              },
            },
          }),
        },
      });
      const response = {
        fulfillmentResponse: {
          messages: [],
        },
      };
      if (books.length === 0) {
        response.fulfillmentResponse.messages.push({
          text: {
            text: ['Không tìm thấy sách nào theo yêu cầu của bạn'],
          },
        });
      } else {
        response.fulfillmentResponse.messages.push({
          text: {
            text: [`Tìm thấy ${books.length} quyển sách`],
          },
        });
        const webUrl = this.configService.get<string>('client_url');
        response.fulfillmentResponse.messages.push({
          payload: {
            richContent: [
              books.map((book) => ({
                type: 'info',
                title: book.title,
                subtitle: book.author,
                image: {
                  rawUrl: book.image_url[0],
                },
                actionLink: `${webUrl}/book/${book.id}`,
              })),
            ],
          },
        });
      }
      return response;
    } catch (error) {
      console.error(error);
      return {
        fulfillmentResponse: {
          messages: [
            {
              text: {
                text: ['Đã xảy ra lỗi'],
              },
            },
          ],
        },
      };
    }
  }
  async searchOrder(req: Request) {
    console.log(req.body);
    try {
      const response = {
        fulfillmentResponse: {
          messages: [],
        },
      };
      const { sessionInfo } = req.body;
      const { parameters } = sessionInfo;
      const { orderid } = parameters;
      const order = await this.prisma.orders.findUniqueOrThrow({
        where: {
          id: orderid,
        },
        include: {
          OrderItems: {
            include: {
              book: true,
            },
          },
        },
      });
      if (order) {
        let status = '';
        switch (order.status) {
          case OrderStatus.PENDING:
            status = 'Đã tiếp nhận đơn hàng trên hệ thống';
            break;
          case OrderStatus.PROCESSING:
            status = 'Đang chờ xử lý';
            break;
          case OrderStatus.DELIVERED:
            status = 'Đang giao hàng';
            break;
          case OrderStatus.CANCELLED:
            status = 'Đã hủy bởi người dùng';
            break;
          case OrderStatus.SUCCESS:
            status = 'Giao hàng thành công';
            break;
          case OrderStatus.REJECT:
            status = 'Đã hủy bởi chủ shop';
            break;
        }
        response.fulfillmentResponse.messages.push({
          text: {
            text: [`Đơn hàng ${order.id} - **${status}**`],
          },
        });
        response.fulfillmentResponse.messages.push({
          payload: {
            richContent: [
              order.OrderItems.map((orderItem) => ({
                type: 'info',
                title: orderItem.book.title,
                subtitle: orderItem.book.author,
                image: {
                  rawUrl: orderItem.book.image_url[0],
                },
              })),
            ],
          },
        });
      } else {
        response.fulfillmentResponse.messages.push({
          text: {
            text: ['Không tìm thấy đơn hàng'],
          },
        });
      }
      return response;
    } catch (error) {
      console.error(error);
      return {
        fulfillmentResponse: {
          messages: [
            {
              text: {
                text: ['Đã xảy ra lỗi'],
              },
            },
          ],
        },
      };
    }
  }
  async bookRecommendation(req: Request) {
    try {
    } catch (error) {
      console.error(error);
      return {
        fulfillmentResponse: {
          messages: [
            {
              text: {
                text: ['Đã xảy ra lỗi'],
              },
            },
          ],
        },
      };
    }
  }
  async orderBook(req: Request) {
    try {
    } catch (error) {
      console.error(error);
      return {
        fulfillmentResponse: {
          messages: [
            {
              text: {
                text: ['Đã xảy ra lỗi'],
              },
            },
          ],
        },
      };
    }
  }
  async searchBookDetails(req: Request) {
    try {
      const { sessionInfo } = req.body;
      const { parameters } = sessionInfo;
      const { bookname, bookauthor } = parameters;
      const result = await this.geminiService.generateBookSummary(
        bookname,
        bookauthor,
      );
      const response = {
        fulfillmentResponse: {
          messages: [],
        },
      };
      response.fulfillmentResponse.messages.push({
        text: {
          text: [result],
        },
      });
      const book = await this.prisma.books.findFirst({
        where: {
          ...(bookname && {
            title: {
              contains: bookname,
              mode: 'insensitive',
            },
          }),
          ...(bookauthor && {
            author: {
              contains: bookauthor,
              mode: 'insensitive',
            },
          }),
        },
        include: {
          Category: true,
        },
      });
      if (book) {
        const existingMessage = response.fulfillmentResponse.messages.find(
          (message) => message.text && Array.isArray(message.text.text),
        );
        if (existingMessage) {
          existingMessage.text.text.push(
            `Cuốn sách **${book.title}** của tác giả **${book.author}** đang được bán tại BookNow với giá ${book.price} VNĐ`,
            `Thể loại: ${book.Category.name}`,
            `Số lượng: ${book.stock_quantity}`,
            `Mô tả: ${book.description}`,
          );
        }
        const webUrl = this.configService.get<string>('client_url');
        response.fulfillmentResponse.messages.push({
          payload: {
            richContent: [
              [
                {
                  type: 'info',
                  title: book.title,
                  subtitle: book.author,
                  image: {
                    rawUrl: book.image_url[0],
                  },
                  actionLink: `${webUrl}/book/${book.id}`,
                },
              ],
            ],
          },
        });
      }
      return response;
    } catch (error) {
      console.log(error);
      return {
        fulfillmentResponse: {
          messages: [
            {
              text: {
                text: ['Đã xảy ra lỗi'],
              },
            },
          ],
        },
      };
    }
  }
}
