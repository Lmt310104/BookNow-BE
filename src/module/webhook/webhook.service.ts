import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { OrderStatus, Prisma } from '@prisma/client';
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
      const condition =
        bookname?.split(/\s+/).filter(Boolean).join(' & ') +
        bookauthor?.split(/\s+/).filter(Boolean).join(' & ') +
        bookcategory?.split(/\s+/).filter(Boolean).join(' & ');
      const books = await this.prisma.books.findMany({
        where: {
          ...(condition && {
            OR: [
              {
                ...(bookname && {
                  title: {
                    contains: bookname,
                    mode: 'insensitive',
                  },
                }),
              },
              {
                ...(bookauthor ?? {
                  author: {
                    contains: bookauthor,
                    mode: 'insensitive',
                  },
                }),
              },
              {
                ...(bookcategory && {
                  Category: {
                    name: {
                      contains: bookcategory,
                      mode: 'insensitive',
                    },
                  },
                }),
              },
              {
                title: {
                  search: condition,
                  mode: 'insensitive',
                },
              },
              {
                author: {
                  search: condition,
                  mode: 'insensitive',
                },
              },
              {
                Category: {
                  name: {
                    search: condition,
                    mode: 'insensitive',
                  },
                },
              },
              {
                description: {
                  search: condition,
                  mode: 'insensitive',
                },
              },
              {
                unaccent: {
                  search: condition,
                  mode: 'insensitive',
                },
              },
            ],
          }),
        },
        orderBy: condition
          ? {
              _relevance: {
                fields: ['title', 'author', 'description'],
                search: condition,
                sort: 'desc',
              },
            }
          : { stock_quantity: 'desc' },
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
              books
                .map((book) => [
                  {
                    type: 'image',
                    rawUrl: book.image_url[0],
                    accessibilityText: 'BookNow',
                  },
                  {
                    type: 'info',
                    title: book.title,
                    subtitle: new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                    }).format(Number(book.price)),
                    actionLink: `${webUrl}/book/${book.id}`,
                  },
                ])
                .flat(),
            ],
          },
        });
      }
      response.fulfillmentResponse.messages.forEach((message) => {
        if (message.payload) {
          console.log(message.payload.richContent);
        }
      });
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
            text: [
              `"🔍 Kết quả tìm kiếm đơn hàng",
                  Mã đơn hàng: #${order.id}",
                  Tình trạng đơn hàng: ${status}`,
            ],
          },
        });
        response.fulfillmentResponse.messages.push({
          payload: {
            richContent: [
              order.OrderItems.map((orderItem) => ({
                type: 'info',
                title: `${orderItem.book.title}`,
                subtitle: `orderItem.book.author - Số lượng: ${orderItem.quantity} - Giá: ${orderItem.price} VNĐ`,
                image: {
                  rawUrl: orderItem.book.image_url[0],
                },
              })),
            ],
          },
        });
        response.fulfillmentResponse.messages.push({
          text: {
            text: [
              `Tổng tiền: ${order.total_price} VNĐ`,
              `Ngày đặt hàng: ${order.created_at.toLocaleString()}`,
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
      const response = {
        fulfillmentResponse: {
          messages: [],
        },
      };
      const { sessionInfo } = req.body;
      const { parameters } = sessionInfo;
      const { bookcategory } = parameters;
      const condition = bookcategory?.split(/\s+/).filter(Boolean).join(' & ');
      const books = await this.prisma.books.findMany({
        where: {
          ...(condition && {
            OR: [
              {
                Category: {
                  name: {
                    contains: bookcategory,
                    mode: 'insensitive',
                  },
                },
              },
              {
                Category: {
                  name: {
                    search: condition,
                    mode: 'insensitive',
                  },
                },
              },
            ],
          }),
        },
        orderBy: [{ sold_quantity: 'desc' }, { avg_stars: 'desc' }],
        take: 5,
      });
      if (books.length === 0) {
        response.fulfillmentResponse.messages.push({
          text: {
            text: ['Không tìm thấy sách nào theo yêu cầu của bạn'],
          },
        });
      } else {
        response.fulfillmentResponse.messages.push({
          text: {
            text: [
              `Đây là top 5 quyển sách được đề xuất cho bạn theo thể loại ${bookcategory}, hãy thử đọc nhé!`,
            ],
          },
        });
        const webUrl = this.configService.get<string>('client_url');
        response.fulfillmentResponse.messages.push({
          payload: {
            richContent: [
              books
                .map((book) => [
                  {
                    type: 'image',
                    rawUrl: book.image_url[0],
                    accessibilityText: 'BookNow',
                  },
                  {
                    type: 'info',
                    title: book.title,
                    subtitle: new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                    }).format(Number(book.price)),
                    actionLink: `${webUrl}/book/${book.id}`,
                  },
                ])
                .flat(),
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
  async orderBook() {
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
  async searchBookDetails(bookname?: string, bookauthor?: string) {
    try {
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
      const condition = (bookname + bookauthor)
        .split(/\s+/)
        .filter(Boolean)
        .join(' & ');
      const book = await this.prisma.books.findFirst({
        where: {
          OR: [
            ...(bookname
              ? [
                  {
                    title: {
                      contains: bookname,
                      mode: 'insensitive' as Prisma.QueryMode,
                    },
                  },
                  {
                    title: {
                      search: condition,
                      mode: 'insensitive' as Prisma.QueryMode,
                    },
                  },
                ]
              : []),
            ...(bookauthor
              ? [
                  {
                    author: {
                      contains: bookauthor,
                      mode: 'insensitive' as Prisma.QueryMode,
                    },
                  },
                  {
                    author: {
                      search: condition,
                      mode: 'insensitive' as Prisma.QueryMode,
                    },
                  },
                ]
              : []),
          ] as Prisma.BooksWhereInput[],
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
      response.fulfillmentResponse.messages.forEach((message) => {
        if (message.text) {
          console.log(message.text.text);
        }
      });
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
  async navigateBook(req: Request) {
    try {
      const { text } = req.body;
      const result = await this.geminiService.navigateCommand(text);
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
      const booksCondition = this.extractBooks(result);
      const condition = booksCondition.map((book) =>
        book
          .replace(/[^a-zA-Z0-9\sÀ-ỹ]/g, '')
          .split(/\s+/)
          .filter(Boolean)
          .join(' & '),
      );
      const finalCondition = condition.join(' | ');
      console.log(finalCondition);
      if (finalCondition) {
        const books = await this.prisma.books.findMany({
          where: {
            OR: [
              {
                title: {
                  search: finalCondition,
                  mode: 'insensitive',
                },
              },
              {
                description: {
                  search: finalCondition,
                  mode: 'insensitive',
                },
              },
              {
                Category: {
                  name: {
                    search: finalCondition,
                    mode: 'insensitive',
                  },
                },
              },
            ],
          },
        });
        const webUrl = this.configService.get<string>('client_url');
        response.fulfillmentResponse.messages.push({
          payload: {
            richContent: [
              books
                .map((book) => [
                  {
                    type: 'image',
                    rawUrl: book.image_url[0],
                    accessibilityText: 'BookNow',
                  },
                  {
                    type: 'info',
                    title: book.title,
                    subtitle: new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                    }).format(Number(book.price)),
                    actionLink: `${webUrl}/book/${book.id}`,
                  },
                ])
                .flat(),
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
  extractBooks(response) {
    const bookPattern = /\*\*(.*?)\*\*/g;
    const books = [];
    let match;
    while ((match = bookPattern.exec(response)) !== null) {
      books.push(match[1]);
    }
    return books;
  }
}
