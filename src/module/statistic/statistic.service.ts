import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StatisticQuery } from './dto/overview_statistic_query.dto';

@Injectable()
export class StatisticService {
  constructor(private readonly prisma: PrismaService) {}
  async getStatistic(query: StatisticQuery) {
    const { fromDate, toDate, status } = query;
    const orders = await this.prisma.orders.findMany({
      where: {
        created_at: {
          gte: new Date(fromDate),
          lte: new Date(toDate),
        },
        ...(status && { status }),
      },
    });
    const revenue = orders.reduce(
      (acc, order) => acc + Number(order.total_price),
      0,
    );
    const totalOrders = orders.length;
    return {
      totalOrders,
      revenue,
    };
  }
  async getProductStatisByAddToCart(query: StatisticQuery) {
    const books = await this.prisma.cartItems.groupBy({
      by: ['book_id'],
      where: {
        created_at: {
          gte: new Date(query.fromDate),
          lte: new Date(query.toDate),
        },
      },
      _count: {
        book_id: true,
      },
      orderBy: {
        _count: {
          book_id: 'desc',
        },
      },
    });
    const bookResult = await Promise.all(
      books.map(async (b) => {
        const book = await this.prisma.books.findUnique({
          where: { id: b.book_id },
        });
        return {
          book,
          totalAddToCart: b._count.book_id,
        };
      }),
    );
    return bookResult;
  }
  async getProductStatisByOrder(query: StatisticQuery) {
    const orders = await this.prisma.orderItems.groupBy({
      by: ['book_id'],
      where: {
        order: {
          created_at: {
            gte: new Date(query.fromDate),
            lte: new Date(query.toDate),
          },
          status: query.status,
        },
      },
      _count: {
        book_id: true,
      },
      orderBy: {
        _count: {
          book_id: 'desc',
        },
      },
    });
    const bookResult = await Promise.all(
      orders.map(async (o) => {
        const book = await this.prisma.books.findUnique({
          where: { id: o.book_id },
        });
        return {
          book,
          totalOrders: o._count.book_id,
        };
      }),
    );
    return bookResult;
  }
  async getProductStatisByRevenue(query: StatisticQuery) {
    const books = await this.prisma.orderItems.groupBy({
      by: ['book_id'],
      where: {
        order: {
          status: query.status,
          created_at: {
            gte: new Date(query.fromDate),
            lte: new Date(query.toDate),
          },
        },
      },
      _sum: {
        total_price: true,
      },
      _count: {
        book_id: true,
      },
      orderBy: {
        _sum: {
          total_price: 'desc',
        },
      },
    });
    const bookResult = await Promise.all(
      books.map(async (b) => {
        const book = await this.prisma.books.findUnique({
          where: { id: b.book_id },
        });
        return {
          book,
          totalRevenue: b._sum.total_price,
        };
      }),
    );
    return bookResult;
  }
  async getProductStatisBySoldQuantity(query: StatisticQuery) {
    const orders = await this.prisma.orderItems.groupBy({
      by: ['book_id'],
      where: {
        order: {
          created_at: {
            gte: new Date(query.fromDate),
            lte: new Date(query.toDate),
          },
          status: query.status,
        },
      },
      _sum: {
        quantity: true,
      },
      orderBy: {
        _sum: {
          quantity: 'desc',
        },
      },
    });
    const bookResult = await Promise.all(
      orders.map(async (o) => {
        const book = await this.prisma.books.findUnique({
          where: { id: o.book_id },
        });
        return {
          book,
          totalQuantity: o._sum.quantity,
        };
      }),
    );
    return bookResult;
  }
  async getRevenueStatisByCustomer(query: StatisticQuery) {
    console.log(query);
    const customers = await this.prisma.orders.groupBy({
      by: ['user_id'],
      where: {
        ...(query.status && { status: query.status }),
        created_at: {
          gte: new Date(query.fromDate),
          lte: new Date(query.toDate),
        },
      },
      _sum: {
        total_price: true,
      },
      _count: {
        id: true,
      },
      orderBy: {
        _sum: {
          total_price: 'desc',
        },
      },
    });
    const customersWithUser = await Promise.all(
      customers.map(async ({ user_id, ...customer }) => {
        const user = await this.prisma.users.findUnique({
          where: { id: user_id },
        });
        return {
          totalOrders: customer._count.id,
          totalRevenue: customer._sum.total_price,
          user,
        };
      }),
    );
    return customersWithUser;
  }

  async getRevenueStatisByCategory(query: StatisticQuery) {
    const books = await this.prisma.orderItems.groupBy({
      by: ['book_id'],
      where: {
        order: {
          status: query.status,
          created_at: {
            gte: new Date(query.fromDate),
            lte: new Date(query.toDate),
          },
        },
      },
      _sum: {
        total_price: true,
      },
      _count: {
        book_id: true,
      },
      orderBy: {
        _sum: {
          total_price: 'desc',
        },
      },
    });
    const bookIds = books.map((b) => b.book_id);
    const bookCategories = await this.prisma.books.findMany({
      where: {
        id: {
          in: bookIds,
        },
      },
      include: {
        Category: true,
      },
    });
    type BookCategoryWithTotalPrice = {
      total_price?: number;
    } & (typeof bookCategories)[0];

    bookCategories.forEach((b: BookCategoryWithTotalPrice) => {
      const matchingBook = books.find((book) => book.book_id === b.id);
      b.total_price = Number(matchingBook?._sum.total_price) || 0;
    });

    const categoryMap = {};

    bookCategories.forEach((b: BookCategoryWithTotalPrice) => {
      if (!categoryMap[b.category_id]) {
        categoryMap[b.category_id] = {
          categoryId: b.category_id,
          totalRevenues: 0,
        };
      }
      categoryMap[b.category_id].totalRevenues += b.total_price;
    });

    // Lấy thông tin category và gộp vào kết quả
    const categoriesResult = await Promise.all(
      Object.values(categoryMap).map(
        async (entry: { categoryId: string; totalRevenues: number }) => {
          const category = await this.prisma.category.findUnique({
            where: { id: entry.categoryId },
          });
          return {
            category,
            totalRevenues: entry.totalRevenues,
          };
        },
      ),
    );

    return categoriesResult;
  }
}
