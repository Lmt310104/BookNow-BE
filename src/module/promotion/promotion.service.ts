import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FindAllPromotionDto } from './dtos/find-all-promotion.dto';
import { CreatePromotionDto } from './dtos/create-promotion.dto';
import { UpdatePromotionDto } from './dtos/update-promotion.dto';

@Injectable()
export class PromotionService {
  constructor(private readonly prisma: PrismaService) {}
  async createNewPromotion(dto: CreatePromotionDto) {
    try {
      if (dto.end_date.getTime() < Date.now()) {
        throw new BadRequestException(
          'End date must be greater than current date',
        );
      }
      if (dto.start_date >= dto.end_date) {
        throw new BadRequestException('Start date must be less than end date');
      }
      dto.book_ids.forEach(async (id) => {
        const book = await this.prisma.books.findUnique({
          where: {
            id,
          },
        });
        if (!book) {
          throw new BadRequestException(`Book with id ${id} not found`);
        }
      });
      return await this.prisma.$transaction(async (tx) => {
        const { book_ids, ...data } = dto;
        const newPromotion = await this.prisma.promotion.create({
          data: data,
          select: {
            id: true,
            name: true,
            start_date: true,
            end_date: true,
          },
        });
        await Promise.all(
          book_ids.map((id) => {
            return tx.promotionBook.create({
              data: {
                book: {
                  connect: {
                    id,
                  },
                },
                promotion: {
                  connect: {
                    id: newPromotion.id,
                  },
                },
              },
            });
          }),
        );
        return newPromotion;
      });
    } catch (error) {
      throw error;
    }
  }
  async getAllPromotions(query: FindAllPromotionDto) {
    const data = await this.prisma.promotion.findMany({
      where: {},
      skip: query.skip,
      take: query.take,
      orderBy: { [query.sortBy]: query.order },
    });
    return { data, length: data.length };
  }
  async updatePromotion(id: string, dto: UpdatePromotionDto) {
    try {
      await this.prisma.promotion.findUniqueOrThrow({
        where: { id: id },
      });
      const filteredDto = Object.fromEntries(
        Object.entries(dto).filter(([_, v]) => v !== null && v !== undefined),
      );
      if (filteredDto.start_date && filteredDto.end_date) {
        if (filteredDto.start_date < filteredDto.end_date) {
          throw new BadRequestException(
            'Chương trình phải kéo dài ít nhất là 1 ngày kể từ khi bắt đầu',
          );
        }
        if (filteredDto.end_date.getDate() < Date.now()) {
          throw new BadRequestException(
            'Thời gian kết thúc chương trình phải lớn hơn thời gian hiện tại',
          );
        }
      }
      if (filteredDto.book_ids) {
        await this.prisma.promotionBook.deleteMany({
          where: {
            promotion_id: id,
          },
        });
        dto.book_ids.forEach(async (book_id) => {
          const book = await this.prisma.books.findUnique({
            where: {
              id: book_id,
            },
          });
          if (!book) {
            throw new NotFoundException(
              `Không tìm thấy sách với id ${book_id}`,
            );
          }
          await this.prisma.promotionBook.create({
            data: {
              promotion_id: id,
              book_id: book_id,
            },
          });
        });
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { book_ids, ...data } = filteredDto;
      return await this.prisma.promotion.update({
        where: { id },
        data: data,
      });
    } catch (error) {
      throw error;
    }
  }
  async getOnePromotion(id: string) {
    try {
      return await this.prisma.promotion.findUniqueOrThrow({
        where: { id },
        include: {
          PromotionBook: {
            include: {
              book: true,
            },
          },
        },
      });
    } catch (error) {
      throw error;
    }
  }
}
