import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FindAllPromotionDto } from './dto/find-all-promotion.dto';
import {
  CreateNormalPromotionDto,
  CreatePromotionComboDto,
  CreatePromotionNormalDetailDto,
  CreatePromotionShockDealDto,
} from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';
import { BookStatus, PromotionCategory } from '@prisma/client';
import { StandardResponse } from 'src/utils/response.dto';

@Injectable()
export class PromotionService {
  constructor(private readonly prisma: PrismaService) {}
  async CreateNewNormalPromotion(dto: CreateNormalPromotionDto) {
    try {
      if (dto.start_date > dto.end_date) {
        throw new BadRequestException('Start date must be before end date');
      }
      // Additional validations can be added here if needed
      // await ValidateProduct(dto.promotion_eligibility);
      // // Validate promotion eligibility details
      // await this.prisma.promotion.create({
      //   data: {
      //     name: dto.name,
      //     start_date: dto.start_date,
      //     end_date: dto.end_date,
      //     description: dto.description,
      //     status: true,
      //     promotion_category: PromotionCategory.SHOP_DISCOUNT,
      //     PromotionNormalDetail: {
      //       create: dto.promotion_eligibility.map((pe) => ({
      //         discount_amount: pe.discount_amount,
      //         min_quantity: pe.min_quantity,
      //         discount_rate: pe.discount_rate,
      //       })),
      //     },
      //   },
      // });
      return new StandardResponse(null, 'Promotion created successfully', 201);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Server error');
    }
  }

  async CreateNewPromotionCombo(dto: CreatePromotionComboDto) {
    try {
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Server error');
    }
  }

  async CreateNewPromotionShockDeal(dto: CreatePromotionShockDealDto) {}

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
      const { _, ...data } = filteredDto;
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
  private async ValidateProduct(
    promotion_eligibility: CreatePromotionNormalDetailDto[],
  ) {
    if (!promotion_eligibility) {
      throw new BadRequestException('Invalid promotion eligibility data');
    }

    const bookIds = promotion_eligibility.map((pe) => pe.book_id);

    // Fetch all books by their IDs
    const books = await this.prisma.books.findMany({
      where: {
        id: {
          in: bookIds,
        },
      },
      select: {
        id: true,
        status: true,
      },
    });

    // Check if all books were found
    if (books.length !== bookIds.length) {
      const foundIds = books.map((book) => book.id);
      const missingIds = bookIds.filter((id) => !foundIds.includes(id));

      throw new NotFoundException(
        `The following books were not found: ${missingIds.join(', ')}`,
      );
    }

    // Check if all books are active
    const inactiveBooks = books.filter(
      (book) => book.status !== BookStatus.ACTIVE,
    );
    if (inactiveBooks.length > 0) {
      const inactiveIds = inactiveBooks.map((book) => book.id);

      throw new BadRequestException(
        `The following books are not active and cannot be included in promotions: ${inactiveIds.join(', ')}`,
      );
    }

    return true;
  }
}
