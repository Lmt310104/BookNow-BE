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
import { FindAllPromotionDto } from './dto/find-all-promotion.dto';
import { PageResponseDto } from 'src/utils/page-response.dto';
import { PageResponseMetaDto } from 'src/utils/page-response-meta.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';
import { EditTimePromotionDto } from './dto/edit-time-promotion.dto';
import { GetAvailableBookForPromotionDto } from './dto/get-available-promotion.dto';
import { CreatePromotionGroupBuyDto } from './dto/create-promotion-group-buy.dto';

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
          promotion_category: PromotionCategory.SHOP_DISCOUNT,
          order_limit: +dto.order_limit || 0,
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
            max_usage_per_user: +dto.max_usage_per_user,
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

  async CreateNewPromotionGroupBuy(dto: CreatePromotionGroupBuyDto) {
    try {
      this.ValidateDate(dto.start_date, dto.end_date);
      return await this.prisma.$transaction(async (tx) => {
        const promotion = await tx.promotion.create({
          data: {
            name: dto.name,
            start_date: dto.start_date,
            end_date: dto.end_date,
            max_usage_per_user: +dto.max_usage_per_user || 1,
            order_limit: +dto.order_limit || 0,
            promotion_category: PromotionCategory.GROUP_DISCOUNT,
            status: PromotionStatus.UPCOMING,
            is_active: dto.is_active !== undefined ? dto.is_active : true,
          },
        });

        tx.promotionGroupBuy.create({
          data: {
            promotion_id: promotion.id,
            required_user_quantity: +dto.group_buy.required_user_quantity,
            discount_amount: +dto.group_buy.discount_amount,
            discount_rate: +dto.group_buy.discount_rate,
          },
        });
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

  async getAllPromotions(query: FindAllPromotionDto) {
    const where: any = {};
    if (query.name) {
      where.name = {
        contains: query.name,
        mode: 'insensitive',
      };
    }
    if (query.is_active !== null) {
      where.is_active = query.is_active;
    }

    if (query.promotion_category) {
      where.promotion_category = query.promotion_category;
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.start_date) {
      where.start_date = {
        gte: new Date(query.start_date),
      };
    }

    if (query.end_date) {
      where.end_date = {
        lte: new Date(query.end_date),
      };
    }
    const totalCount = await this.prisma.promotion.count({ where });
    const data = await this.prisma.promotion.findMany({
      where: where,
      include: {
        PromotionNormalDetail: {
          include: {
            Book: true,
          },
        },
        PromotionCombo: {
          include: {
            PromotionComboCondition: true,
            PromotionComboProduct: {
              include: {
                Book: true,
              },
            },
          },
        },
        PromotionShockDeal: {
          include: {
            PromotionShockDealBook: {
              include: {
                Book: true,
              },
            },
            PromotionShockDealCondition: true,
            PromotionShockDealFreeGiftBook: true,
          },
        },
      },
      skip: query.skip,
      take: query.take,
      orderBy: { [query.sortBy]: query.order },
    });
    const transformed = data.map((promotion) => {
      return {
        ...promotion,
        PromotionNormalDetail:
          promotion.PromotionNormalDetail.length > 0
            ? promotion.PromotionNormalDetail
            : null,
      };
    });

    return new PageResponseDto(
      transformed,
      new PageResponseMetaDto({
        pageOptionsDto: query,
        itemCount: totalCount,
      }),
    );
  }
  async getOnePromotion(id: string) {
    try {
      const promotion = await this.prisma.promotion.findUniqueOrThrow({
        where: { id },
        include: {
          PromotionCombo: {
            include: {
              PromotionComboCondition: true,
              PromotionComboProduct: {
                include: {
                  Book: true,
                },
              },
            },
          },
          PromotionNormalDetail: {
            include: {
              Book: true,
            },
          },
          PromotionShockDeal: {
            include: {
              PromotionShockDealBook: {
                include: {
                  Book: true,
                },
              },
              PromotionShockDealCondition: true,
              PromotionShockDealFreeGiftBook: true,
            },
          },
        },
      });
      return new StandardResponse(
        promotion,
        'Promotion retrieved successfully',
        200,
      );
    } catch (error) {
      throw error;
    }
  }

  async activatePromotion(id: string) {
    await this.prisma.promotion.findUniqueOrThrow({
      where: { id },
    });
    await this.prisma.promotion.update({
      where: { id },
      data: {
        is_active: true,
      },
    });
    return new StandardResponse(true, 'Active promotion successfully', 200);
  }

  async deactivatePromotion(id: string) {
    await this.prisma.promotion.findUniqueOrThrow({
      where: { id, is_active: true },
    });

    await this.prisma.promotion.update({
      where: { id },
      data: {
        is_active: false,
        status: PromotionStatus.COMPLETED,
      },
    });
    return new StandardResponse(true, 'Deactive promotion successfully', 200);
  }

  async updatePromotion(id: string, dto: UpdatePromotionDto) {
    try {
      const existingPromotion = await this.prisma.promotion.findUniqueOrThrow({
        where: { id },
        include: {
          PromotionNormalDetail: true,
          PromotionCombo: true,
          PromotionShockDeal: true,
        },
      });
      if (!existingPromotion.is_active) {
        throw new BadRequestException(
          'You can not edit this promotion campaign because it is inactive',
        );
      }

      // Filter out undefined values
      const filteredDto = Object.fromEntries(
        Object.entries(dto).filter(([_, v]) => v !== null && v !== undefined),
      );

      return await this.prisma.$transaction(async (tx) => {
        await tx.promotion.update({
          where: { id },
          data: {
            name: filteredDto.name,
            max_usage_per_user: +filteredDto.max_usage_per_user,
            order_limit: +filteredDto.order_limit,
          },
        });
        // For promotion category-specific updates
        switch (existingPromotion.promotion_category) {
          case PromotionCategory.SHOP_DISCOUNT:
            if (
              filteredDto.normal_details &&
              filteredDto.normal_details.length > 0
            ) {
              // Validate the book IDs in normal details
              await this.ValidateProduct(filteredDto.normal_details);

              // Delete existing details
              await tx.promotionNormalDetail.deleteMany({
                where: { promotion_id: id },
              });

              // Create new details
              await tx.promotionNormalDetail.createMany({
                data: filteredDto.normal_details.map((detail) => ({
                  promotion_id: id,
                  book_id: detail.book_id,
                  discount_amount: detail.discount_amount,
                  discount_rate: detail.discount_rate,
                })),
              });
            }
            break;
          case PromotionCategory.COMBO_DISCOUNT:
            if (
              existingPromotion.PromotionCombo &&
              filteredDto.combo_book_ids &&
              filteredDto.combo_book_ids.length > 0
            ) {
              await this.ValidateBookIds(filteredDto.combo_book_ids);

              const comboId = existingPromotion.PromotionCombo[0].id;

              await tx.promotionComboProduct.deleteMany({
                where: { promotion_combo_id: comboId },
              });

              await tx.promotionComboProduct.createMany({
                data: filteredDto.combo_book_ids.map((bookId) => ({
                  promotion_combo_id: comboId,
                  book_id: bookId,
                })),
              });

              if (
                filteredDto.combo_conditions &&
                filteredDto.combo_conditions.length > 0
              ) {
                await tx.promotionComboCondition.deleteMany({
                  where: { promotion_combo_id: comboId },
                });
                await tx.promotionComboCondition.createMany({
                  data: filteredDto.combo_conditions.map((condition) => ({
                    promotion_combo_id: comboId,
                    quantity: condition.quantity,
                    discount_value: condition.discount_value,
                  })),
                });
              }
            }
            break;
          case PromotionCategory.DEAL_DISCOUNT:
            if (existingPromotion.PromotionShockDeal) {
              const shockDealId = existingPromotion.PromotionShockDeal[0].id;
              const shockDealType =
                existingPromotion.PromotionShockDeal[0]
                  .promotion_shock_deal_type;

              if (
                filteredDto.shock_deal_book_ids &&
                filteredDto.shock_deal_book_ids.length > 0
              ) {
                await this.ValidateBookIds(filteredDto.shock_deal_book_ids);

                await tx.promotionShockDealBook.deleteMany({
                  where: { promotion_shock_deal_id: shockDealId },
                });

                await tx.promotionShockDealBook.createMany({
                  data: filteredDto.shock_deal_book_ids.map((bookId) => ({
                    promotion_shock_deal_id: shockDealId,
                    book_id: bookId,
                  })),
                });
              }
              if (
                shockDealType === PromotionShockDealType.BUY_WITH_SHOCK_DEAL
              ) {
                if (
                  filteredDto.shock_deal_conditions &&
                  filteredDto.shock_deal_conditions.length > 0
                ) {
                  for (const condition of filteredDto.shock_deal_conditions) {
                    if (
                      (condition.discount_amount === null ||
                        condition.discount_amount === undefined) &&
                      (condition.discount_rate === null ||
                        condition.discount_rate === undefined)
                    ) {
                      throw new BadRequestException(
                        'Each condition must have either a discount amount or a discount rate',
                      );
                    }

                    if (
                      condition.discount_rate !== null &&
                      condition.discount_rate !== undefined
                    ) {
                      if (
                        condition.discount_rate < 0 ||
                        condition.discount_rate > 100
                      ) {
                        throw new BadRequestException(
                          'Discount rate must be between 0 and 100',
                        );
                      }
                    }
                  }

                  await tx.promotionShockDealCondition.deleteMany({
                    where: { promotion_shock_deal_id: shockDealId },
                  });

                  await tx.promotionShockDealCondition.createMany({
                    data: filteredDto.shock_deal_conditions.map(
                      (condition) => ({
                        promotion_shock_deal_id: shockDealId,
                        book_id: condition.book_id,
                        discount_amount: condition.discount_amount,
                        discount_rate: condition.discount_rate,
                      }),
                    ),
                  });
                }
              } else if (
                shockDealType === PromotionShockDealType.BUY_TO_GET_GIFT
              ) {
                if (
                  filteredDto.required_purchase_quantity ||
                  filteredDto.gift_quantity
                ) {
                  await tx.promotionShockDeal.update({
                    where: { id: shockDealId },
                    data: {
                      required_purchase_quantity:
                        filteredDto.required_purchase_quantity,
                      gift_quantity: filteredDto.gift_quantity,
                    },
                  });
                }

                if (
                  filteredDto.shock_deal_gift_books &&
                  filteredDto.shock_deal_gift_books.length > 0
                ) {
                  await this.ValidateBookIds(filteredDto.shock_deal_gift_books);

                  await tx.promotionShockDealFreeGiftBook.deleteMany({
                    where: { promotion_shock_deal_id: shockDealId },
                  });

                  await tx.promotionShockDealFreeGiftBook.createMany({
                    data: filteredDto.shock_deal_gift_books.map((bookId) => ({
                      promotion_shock_deal_id: shockDealId,
                      book_id: bookId,
                    })),
                  });
                }
              }
            }
            break;
        }
        return new StandardResponse(
          { promotionId: id },
          'Promotion updated successfully',
          200,
        );
      });
    } catch (error) {
      console.log(error);

      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to update promotion');
    }
  }

  async editPromotionTime(id: string, dto: EditTimePromotionDto) {
    try {
      const promotion = await this.prisma.promotion.findUniqueOrThrow({
        where: { id },
        select: {
          id: true,
          start_date: true,
          end_date: true,
          status: true,
        },
      });

      const now = new Date();
      const newStartDate = dto.start_date || promotion.start_date;
      const newEndDate = dto.end_date || promotion.end_date;

      if (newStartDate > newEndDate) {
        throw new BadRequestException('Start date must be before end date');
      }

      if (promotion.start_date <= now && newStartDate > now) {
        throw new BadRequestException(
          'Cannot change start date of an active or past promotion to a future date',
        );
      }
      if (promotion.end_date < now) {
        throw new BadRequestException(
          'Cannot modify end date of an already concluded promotion',
        );
      }

      let newStatus = promotion.status;
      if (newStartDate > now) {
        newStatus = PromotionStatus.UPCOMING;
      } else if (newEndDate < now) {
        newStatus = PromotionStatus.COMPLETED;
      } else {
        newStatus = PromotionStatus.ONGOING;
      }

      const updatedPromotion = await this.prisma.promotion.update({
        where: { id },
        data: {
          start_date: newStartDate,
          end_date: newEndDate,
          status: newStatus,
        },
      });
      return new StandardResponse(
        updatedPromotion,
        'Promotion time period updated successfully',
        200,
      );
    } catch (error) {
      console.log(error);

      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Failed to update promotion time period',
      );
    }
  }

  async getAvailableBookForPromotion(query: GetAvailableBookForPromotionDto) {
    const where: any = {
      status: BookStatus.ACTIVE,
    };

    if (query.book_name) {
      where.OR = [
        {
          title: {
            contains: query.book_name,
            mode: 'insensitive',
          },
        },
        {
          unaccent: {
            contains: query.book_name,
            mode: 'insensitive',
          },
        },
      ];
    }

    const currentPromotionCampaign = await this.prisma.promotion.findMany({
      where: {
        start_date: { lte: new Date() },
        end_date: { gte: new Date() },
        is_active: true,
        promotion_category: query.promotion_type,
      },
      select: {
        id: true,
        name: true,
        PromotionNormalDetail: {
          select: {
            book_id: true,
          },
        },
        PromotionCombo: {
          select: {
            PromotionComboProduct: {
              select: {
                book_id: true,
              },
            },
          },
        },
        PromotionShockDeal: {
          select: {
            PromotionShockDealBook: {
              select: {
                book_id: true,
              },
            },
          },
        },
      },
    });
    const promotedBookIds = new Set<string>();

    currentPromotionCampaign.forEach((promotion) => {
      // Get book IDs from normal promotions
      if (
        promotion.PromotionNormalDetail &&
        promotion.PromotionNormalDetail.length > 0
      ) {
        promotion.PromotionNormalDetail.forEach((detail) => {
          promotedBookIds.add(detail.book_id);
        });
      }

      // Get book IDs from combo promotions
      if (promotion.PromotionCombo) {
        const comboProducts = promotion.PromotionCombo.PromotionComboProduct;
        if (comboProducts && comboProducts.length > 0) {
          comboProducts.forEach((product) => {
            promotedBookIds.add(product.book_id);
          });
        }
      }

      // Get book IDs from shock deal promotions
      if (promotion.PromotionShockDeal) {
        const shockDealBooks =
          promotion.PromotionShockDeal.PromotionShockDealBook;
        if (shockDealBooks && shockDealBooks.length > 0) {
          shockDealBooks.forEach((book) => {
            promotedBookIds.add(book.book_id);
          });
        }
      }
    });

    if (promotedBookIds.size > 0) {
      where.id = {
        notIn: Array.from(promotedBookIds),
      };
    }

    const totalCount = await this.prisma.books.count({ where });

    const books = await this.prisma.books.findMany({
      where,
      select: {
        id: true,
        title: true,
        author: true,
        price: true,
        stock_quantity: true,
        image_url: true,
        Category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        [query.sortBy || 'title']: query.order || 'asc',
      },
      skip: query.skip || 0,
      take: query.take || 10,
    });

    // Return paginated results
    return new PageResponseDto(
      books,
      new PageResponseMetaDto({
        pageOptionsDto: query,
        itemCount: totalCount,
      }),
    );
  }
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
