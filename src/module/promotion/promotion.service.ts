import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FindAllPromotionDto } from './dto/find-all-promotion.dto';
import {
  CreateNormalPromotionDto,
  CreatePromotionComboDto,
  CreatePromotionShockDealDto,
} from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';

@Injectable()
export class PromotionService {
  constructor(private readonly prisma: PrismaService) {}
  async CreateNewNormalPromotion(dto: CreateNormalPromotionDto) {}

  async CreateNewPromotionCombo(dto: CreatePromotionComboDto) {}

  async CreateNewPromotionShockDeal(dto: CreatePromotionShockDealDto){}

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
