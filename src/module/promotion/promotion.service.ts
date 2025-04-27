import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateNormalPromotionDto,
  CreatePromotionComboDto,
  CreatePromotionNormalDetailDto,
  CreatePromotionShockDealDto,
} from './dto/create-promotion.dto';
import {
  BookStatus,
  PromotionCategory,
  PromotionShockDealType,
  PromotionStatus,
} from '@prisma/client';
import { StandardResponse } from 'src/utils/response.dto';

@Injectable()
export class PromotionService {
  constructor(private readonly prisma: PrismaService) {}
  async CreateNewNormalPromotion(dto: CreateNormalPromotionDto) {
    try {
      if (dto.start_date > dto.end_date) {
        throw new BadRequestException('Start date must be before end date');
      }
      await this.ValidateProduct(dto.promotion_eligibility);
      // Validate promotion eligibility details
      await this.prisma.promotion.create({
        data: {
          name: dto.name,
          start_date: dto.start_date,
          end_date: dto.end_date,
          description: dto.description,
          promotion_category: PromotionCategory.SHOP_DISCOUNT,
          order_limit: dto.order_limit ?? 0,
          status: PromotionStatus.UPCOMING,
          PromotionNormalDetail: {
            create: dto.promotion_eligibility.map((detail) => ({
              discount_amount: detail.discount_amount,
              discount_rate: detail.discount_rate,
              book_id: detail.book_id,
            })),
          },
        },
      });
      return new StandardResponse(null, 'Promotion created successfully', 201);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Server error');
    }
  }

  async CreateNewPromotionCombo(dto: CreatePromotionComboDto) {
    try {
      if (dto.start_date > dto.end_date) {
        throw new BadRequestException('Start date must be before end date');
      }

      // Validate the book IDs
      await this.ValidateBookIds(dto.book_ids);

      // Use transaction to ensure data consistency
      return await this.prisma.$transaction(async (tx) => {
        // Create the base promotion
        const promotion = await tx.promotion.create({
          data: {
            name: dto.name,
            start_date: dto.start_date,
            end_date: dto.end_date,
            description: dto.description,
            max_usage_per_user: dto.max_usage_per_user,
            promotion_category: PromotionCategory.COMBO_DISCOUNT,
            status: PromotionStatus.UPCOMING,
          },
        });

        // Create the PromotionCombo
        const promotionCombo = await tx.promotionCombo.create({
          data: {
            promotion_id: promotion.id,
            promotion_combo_type: dto.type,
          },
        });

        // Create PromotionComboProduct entries for each book
        await tx.promotionComboProduct.createMany({
          data: dto.book_ids.map((bookId) => ({
            promotion_combo_id: promotionCombo.id,
            book_id: bookId,
          })),
        });

        // Create PromotionComboCondition if conditions are provided
        if (dto.eligibilities && dto.eligibilities.length > 0) {
          await tx.promotionComboCondition.createMany({
            data: dto.eligibilities.map((eligibility) => ({
              promotion_combo_id: promotionCombo.id,
              quantity: eligibility.quantity,
              discount_value: eligibility.discount_value,
            })),
          });
        }

        return new StandardResponse(
          { promotionId: promotion.id },
          'Combo promotion created successfully',
          201,
        );
      });
    } catch (error) {
      console.log(error);

      // Preserve specific error types for better client feedback
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      throw new InternalServerErrorException('Server error');
    }
  }

  async CreateNewPromotionShockDeal(dto: CreatePromotionShockDealDto) {
    try {
      this.ValidateDate(dto.start_date, dto.end_date);
      this.ValidateBookIds(dto.book_ids);
      if (
        dto.type === PromotionShockDealType.BUY_WITH_SHOCK_DEAL &&
        (!dto.promotion_shockdeal_conditions ||
          dto.promotion_shockdeal_conditions.length === 0)
      ) {
        throw new BadRequestException(
          'For BUY_WITH_SHOCK_DEAL type, at least one promotion shock deal condition is required',
        );
      }

      if (
        dto.type === PromotionShockDealType.BUY_TO_GET_GIFT &&
        (!dto.promotion_shockdeal_freegift_book ||
          dto.promotion_shockdeal_freegift_book.length === 0 ||
          !dto.required_purchase_quantity ||
          dto.required_purchase_quantity <= 0 ||
          !dto.gift_quantity ||
          dto.gift_quantity <= 0)
      ) {
        throw new BadRequestException(
          'For BUY_TO_GET_GIFT type, at least one free gift book, a positive required purchase quantity, and a positive gift quantity are required',
        );
      }
      if (dto.type === PromotionShockDealType.BUY_WITH_SHOCK_DEAL) {
        if (
          !dto.promotion_shockdeal_conditions ||
          dto.promotion_shockdeal_conditions.length === 0
        ) {
          throw new BadRequestException(
            'For BUY_WITH_SHOCK_DEAL type, at least one promotion shock deal condition is required',
          );
        }
        await this.ValidateBookIds(
          dto.promotion_shockdeal_conditions.map((p) => p.book_id),
        );
        // Validate each condition
        for (const condition of dto.promotion_shockdeal_conditions) {
          if (
            (condition.discount_amount === null ||
              condition.discount_amount === undefined) &&
            (condition.discount_rate === null ||
              condition.discount_rate === undefined)
          ) {
            // Ensure at least one discount type is provided
            throw new BadRequestException(
              'Each condition must have either a discount amount or a discount rate',
            );
          }

          // Validate discount rate is within valid range (0-100%)
          if (
            condition.discount_rate !== null &&
            condition.discount_rate !== undefined
          ) {
            if (condition.discount_rate < 0 || condition.discount_rate > 100) {
              throw new BadRequestException(
                'Discount rate must be between 0 and 100',
              );
            }
          }
        }
      }
      if (dto.type === PromotionShockDealType.BUY_TO_GET_GIFT) {
        if (
          !dto.promotion_shockdeal_freegift_book ||
          dto.promotion_shockdeal_freegift_book.length === 0
        ) {
          throw new BadRequestException(
            'For BUY_TO_GET_GIFT type, at least one free gift book is required',
          );
        }

        if (
          !dto.required_purchase_quantity ||
          dto.required_purchase_quantity <= 0
        ) {
          throw new BadRequestException(
            'Required purchase quantity must be a positive number',
          );
        }

        if (!dto.gift_quantity || dto.gift_quantity <= 0) {
          throw new BadRequestException(
            'Gift quantity must be a positive number',
          );
        }

        // Validate gift books existence and status
        await this.ValidateBookIds(
          dto.promotion_shockdeal_freegift_book.map((p) => p.book_id),
        );
      }
      return await this.prisma.$transaction(async (tx) => {
        const promotion = await tx.promotion.create({
          data: {
            name: dto.name,
            start_date: dto.start_date,
            end_date: dto.end_date,
            description: dto.description,
            promotion_category: PromotionCategory.DEAL_DISCOUNT,
            status: PromotionStatus.UPCOMING,
          },
        });
        const promotionShockDeal = await tx.promotionShockDeal.create({
          data: {
            promotion_id: promotion.id,
            promotion_shock_deal_type: dto.type,
            required_purchase_quantity:
              dto.type === PromotionShockDealType.BUY_TO_GET_GIFT
                ? dto.required_purchase_quantity
                : null,
            gift_quantity:
              dto.type === PromotionShockDealType.BUY_TO_GET_GIFT
                ? dto.gift_quantity
                : null,
          },
        });
        await tx.promotionShockDealBook.createMany({
          data: dto.book_ids.map((bookId) => ({
            promotion_shock_deal_id: promotionShockDeal.id,
            book_id: bookId,
          })),
        });
        if (
          dto.type === PromotionShockDealType.BUY_WITH_SHOCK_DEAL &&
          dto.promotion_shockdeal_conditions &&
          dto.promotion_shockdeal_conditions.length > 0
        ) {
          await tx.promotionShockDealCondition.createMany({
            data: dto.promotion_shockdeal_conditions.map((condition) => ({
              promotion_shock_deal_id: promotionShockDeal.id,
              book_id: condition.book_id,
              discount_amount: condition.discount_amount,
              discount_rate: condition.discount_rate,
            })),
          });
        }

        // Handle free gift books if applicable
        if (
          dto.type === PromotionShockDealType.BUY_TO_GET_GIFT &&
          dto.promotion_shockdeal_freegift_book &&
          dto.promotion_shockdeal_freegift_book.length > 0
        ) {
          await tx.promotionShockDealFreeGiftBook.createMany({
            data: dto.promotion_shockdeal_freegift_book.map((condition) => ({
              promotion_shock_deal_id: promotionShockDeal.id,
              book_id: condition.book_id,
            })),
          });
        }
        return new StandardResponse(
          { promotionId: promotion.id },
          'Combo promotion created successfully',
          201,
        );
      });
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Server error');
    }
  }

  // async getAllPromotions(query: FindAllPromotionDto) {
  //   const data = await this.prisma.promotion.findMany({
  //     where: {},
  //     skip: query.skip,
  //     take: query.take,
  //     orderBy: { [query.sortBy]: query.order },
  //   });
  //   return { data, length: data.length };
  // }
  // async updatePromotion(id: string, dto: UpdatePromotionDto) {
  //   try {
  //     await this.prisma.promotion.findUniqueOrThrow({
  //       where: { id: id },
  //     });
  //     const filteredDto = Object.fromEntries(
  //       Object.entries(dto).filter(([_, v]) => v !== null && v !== undefined),
  //     );
  //     if (filteredDto.start_date && filteredDto.end_date) {
  //       if (filteredDto.start_date < filteredDto.end_date) {
  //         throw new BadRequestException(
  //           'Chương trình phải kéo dài ít nhất là 1 ngày kể từ khi bắt đầu',
  //         );
  //       }
  //       if (filteredDto.end_date.getDate() < Date.now()) {
  //         throw new BadRequestException(
  //           'Thời gian kết thúc chương trình phải lớn hơn thời gian hiện tại',
  //         );
  //       }
  //     }
  //     if (filteredDto.book_ids) {
  //       await this.prisma.promotionBook.deleteMany({
  //         where: {
  //           promotion_id: id,
  //         },
  //       });
  //       dto.book_ids.forEach(async (book_id) => {
  //         const book = await this.prisma.books.findUnique({
  //           where: {
  //             id: book_id,
  //           },
  //         });
  //         if (!book) {
  //           throw new NotFoundException(
  //             `Không tìm thấy sách với id ${book_id}`,
  //           );
  //         }
  //         await this.prisma.promotionBook.create({
  //           data: {
  //             promotion_id: id,
  //             book_id: book_id,
  //           },
  //         });
  //       });
  //     }
  //     const { _, ...data } = filteredDto;
  //     return await this.prisma.promotion.update({
  //       where: { id },
  //       data: data,
  //     });
  //   } catch (error) {
  //     throw error;
  //   }
  // }
  // async getOnePromotion(id: string) {
  //   try {
  //     return await this.prisma.promotion.findUniqueOrThrow({
  //       where: { id },
  //       include: {
  //         PromotionBook: {
  //           include: {
  //             book: true,
  //           },
  //         },
  //       },
  //     });
  //   } catch (error) {
  //     throw error;
  //   }
  // }
  private async ValidateProduct(
    promotion_eligibility: CreatePromotionNormalDetailDto[],
  ) {
    if (!promotion_eligibility) {
      throw new BadRequestException('Invalid promotion eligibility data');
    }

    const bookIds = promotion_eligibility.map((pe) => pe.book_id);

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

    if (books.length !== bookIds.length) {
      const foundIds = books.map((book) => book.id);
      const missingIds = bookIds.filter((id) => !foundIds.includes(id));

      throw new NotFoundException(
        `The following books were not found: ${missingIds.join(', ')}`,
      );
    }

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

  private async ValidateBookIds(book_ids: string[]) {
    if (!book_ids || !Array.isArray(book_ids) || book_ids.length === 0) {
      throw new BadRequestException(
        'Book IDs must be provided as a non-empty array',
      );
    }

    const books = await this.prisma.books.findMany({
      where: {
        id: {
          in: book_ids,
        },
      },
      select: {
        id: true,
        status: true,
        title: true,
      },
    });

    if (books.length !== book_ids.length) {
      const foundIds = books.map((book) => book.id);
      const missingIds = book_ids.filter((id) => !foundIds.includes(id));

      throw new NotFoundException(
        `The following books were not found: ${missingIds.join(', ')}`,
      );
    }

    const inactiveBooks = books.filter(
      (book) => book.status !== BookStatus.ACTIVE,
    );

    if (inactiveBooks.length > 0) {
      const inactiveBookDetails = inactiveBooks.map(
        (book) => `${book.title || 'Unknown'} (${book.id})`,
      );

      throw new BadRequestException(
        `The following books are not active and cannot be included in promotions: ${inactiveBookDetails.join(', ')}`,
      );
    }
    return books;
  }

  private ValidateDate(start_date: Date, end_date: Date) {
    const now = new Date();
    if (start_date > end_date) {
      throw new BadRequestException('Start date must be before end date');
    }

    if (start_date <= now) {
      throw new BadRequestException('Start date must be in the future');
    }
  }
}
