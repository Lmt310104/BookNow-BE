import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import {
  PromotionCategory,
  PromotionStatus,
  PromotionShockDealType,
} from '@prisma/client';
@Injectable()
export class PromotionSchedulerService {
  private readonly logger = new Logger(PromotionSchedulerService.name);

  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_HOUR)
  async handlePromotionStatusUpdates() {
    this.logger.log('Running scheduled promotion status update');
    const now = new Date();

    try {
      const activatingPromotions = await this.prisma.promotion.findMany({
        where: {
          status: PromotionStatus.UPCOMING,
          start_date: { lte: now },
          end_date: { gt: now },
          is_active: true,
        },
        include: {
          PromotionNormalDetail: {
            include: {
              Book: true,
            },
          },
          PromotionShockDeal: {
            include: {
              PromotionShockDealCondition: {
                include: {
                  Book: true,
                },
              },
            },
          },
        },
      });

      const expiredPromotions = await this.prisma.promotion.findMany({
        where: {
          status: PromotionStatus.ONGOING,
          end_date: { lte: now },
          is_active: true,
        },
        include: {
          PromotionNormalDetail: {
            include: {
              Book: true,
            },
          },
          PromotionShockDeal: {
            include: {
              PromotionShockDealCondition: {
                include: {
                  Book: true,
                },
              },
            },
          },
        },
      });

      // Process activating promotions
      for (const promotion of activatingPromotions) {
        await this.activatePromotion(promotion);
      }

      // Process expired promotions
      for (const promotion of expiredPromotions) {
        await this.deactivatePromotion(promotion);
      }

      this.logger.log(
        `Updated ${activatingPromotions.length} promotions to active and ${expiredPromotions.length} promotions to expired`,
      );
    } catch (error) {
      this.logger.error('Error in promotion status update cron job', error);
    }
  }

  private async activatePromotion(promotion: any) {
    try {
      // Update promotion status
      await this.prisma.promotion.update({
        where: { id: promotion.id },
        data: { status: PromotionStatus.ONGOING },
      });

      // Update book prices based on promotion type
      await this.updateBookPrices(promotion, true);

      this.logger.log(
        `Activated promotion: ${promotion.id} - ${promotion.name}`,
      );
    } catch (error) {
      this.logger.error(`Failed to activate promotion ${promotion.id}`, error);
    }
  }

  private async deactivatePromotion(promotion: any) {
    try {
      // Update promotion status
      await this.prisma.promotion.update({
        where: { id: promotion.id },
        data: { status: PromotionStatus.COMPLETED },
      });

      // Restore original book prices
      await this.updateBookPrices(promotion, false);

      this.logger.log(
        `Deactivated promotion: ${promotion.id} - ${promotion.name}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to deactivate promotion ${promotion.id}`,
        error,
      );
    }
  }

  private async updateBookPrices(promotion: any, isActivating: boolean) {
    // Processing depends on promotion category
    switch (promotion.promotion_category) {
      case PromotionCategory.SHOP_DISCOUNT:
        await this.updateNormalPromotionPrices(promotion, isActivating);
        break;

      case PromotionCategory.DEAL_DISCOUNT:
        if (promotion.PromotionShockDeal) {
          // await this.updateShockDealPrices(promotion, isActivating);
        }
        break;

      // COMBO_DISCOUNT doesn't affect individual book prices
      case PromotionCategory.COMBO_DISCOUNT:
        this.logger.log(
          `Skipping price updates for combo promotion ${promotion.id} - combo discounts are applied at checkout`,
        );
        break;
    }
  }

  private async updateNormalPromotionPrices(
    promotion: any,
    isActivating: boolean,
  ) {
    if (
      !promotion.PromotionNormalDetail ||
      promotion.PromotionNormalDetail.length === 0
    ) {
      return;
    }

    // Process each book in the promotion
    for (const detail of promotion.PromotionNormalDetail) {
      try {
        const book = await this.prisma.books.findUnique({
          where: { id: detail.book_id },
        });

        if (!book) continue;

        let newPrice = null;

        if (isActivating) {
          // Apply discount to calculate new price
          const originalPrice = Number(book.price);

          if (detail.discount_rate && Number(detail.discount_rate) > 0) {
            // Percentage discount
            const discountAmount =
              originalPrice * (Number(detail.discount_rate) / 100);
            newPrice = originalPrice - discountAmount;
          } else if (
            detail.discount_amount &&
            Number(detail.discount_amount) > 0
          ) {
            // Fixed amount discount
            newPrice = Math.max(
              0,
              originalPrice - Number(detail.discount_amount),
            );
          } else {
            // No valid discount specified
            continue;
          }
        } else {
          // Restore original price when deactivating
          // We need to check if any other active promotions affect this book
          const otherActivePromotions =
            await this.findOtherActivePromotionsForBook(
              promotion.id,
              detail.book_id,
            );

          if (otherActivePromotions.length > 0) {
            // Find the best discount from other active promotions
            const bestPrice = await this.calculateBestPrice(
              detail.book_id,
              otherActivePromotions,
            );
            newPrice = bestPrice;
          } else {
            // No other promotions, restore to original price
            newPrice = Number(book.price);
          }
        }

        // Update the book's current price
        if (newPrice !== null) {
          await this.prisma.books.update({
            where: { id: detail.book_id },
            data: {
              current_price: newPrice,
            },
          });

          this.logger.log(
            `${isActivating ? 'Applied' : 'Removed'} discount for book ${detail.book_id}, new price: ${newPrice}`,
          );
        }
      } catch (error) {
        this.logger.error(
          `Error updating price for book ${detail.book_id}`,
          error,
        );
      }
    }
  }

  private async updateShockDealPrices(promotion: any, isActivating: boolean) {
    const shockDeal = promotion.PromotionShockDeal;
    if (!shockDeal) return;

    // Only BUY_WITH_SHOCK_DEAL type affects individual book prices
    if (
      shockDeal.promotion_shock_deal_type !==
      PromotionShockDealType.BUY_WITH_SHOCK_DEAL
    ) {
      this.logger.log(
        `Skipping price updates for BUY_TO_GET_GIFT shock deal ${promotion.id} - discounts applied at checkout`,
      );
      return;
    }

    if (
      !shockDeal.PromotionShockDealCondition ||
      shockDeal.PromotionShockDealCondition.length === 0
    ) {
      return;
    }

    // Process each book in the shock deal conditions
    for (const condition of shockDeal.PromotionShockDealCondition) {
      try {
        const book = await this.prisma.books.findUnique({
          where: { id: condition.book_id },
        });

        if (!book) continue;

        let newPrice = null;

        if (isActivating) {
          // Apply discount
          const originalPrice = Number(book.price);

          if (condition.discount_rate && Number(condition.discount_rate) > 0) {
            // Percentage discount
            const discountAmount =
              originalPrice * (Number(condition.discount_rate) / 100);
            newPrice = originalPrice - discountAmount;
          } else if (
            condition.discount_amount &&
            Number(condition.discount_amount) > 0
          ) {
            // Fixed amount discount
            newPrice = Math.max(
              0,
              originalPrice - Number(condition.discount_amount),
            );
          } else {
            // No valid discount specified
            continue;
          }
        } else {
          // Restore original price when deactivating
          // Check if any other active promotions affect this book
          const otherActivePromotions =
            await this.findOtherActivePromotionsForBook(
              promotion.id,
              condition.book_id,
            );

          if (otherActivePromotions.length > 0) {
            // Find the best discount from other active promotions
            const bestPrice = await this.calculateBestPrice(
              condition.book_id,
              otherActivePromotions,
            );
            newPrice = bestPrice;
          } else {
            // No other promotions, restore to original price
            newPrice = Number(book.price);
          }
        }

        // Update the book's current price
        if (newPrice !== null) {
          await this.prisma.books.update({
            where: { id: condition.book_id },
            data: {
              current_price: newPrice,
            },
          });

          this.logger.log(
            `${isActivating ? 'Applied' : 'Removed'} shock deal for book ${condition.book_id}, new price: ${newPrice}`,
          );
        }
      } catch (error) {
        this.logger.error(
          `Error updating price for shock deal book ${condition.book_id}`,
          error,
        );
      }
    }
  }

  private async findOtherActivePromotionsForBook(
    currentPromotionId: string,
    bookId: string,
  ) {
    const now = new Date();

    // Find active normal promotions for this book
    const normalPromotions = await this.prisma.promotionNormalDetail.findMany({
      where: {
        book_id: bookId,
        Promotion: {
          id: { not: currentPromotionId },
          status: PromotionStatus.ONGOING,
          is_active: true,
          start_date: { lte: now },
          end_date: { gt: now },
        },
      },
      include: {
        Promotion: true,
      },
    });

    // Find active shock deal promotions for this book

    return [...normalPromotions];
  }

  private async calculateBestPrice(bookId: string, activePromotions: any[]) {
    const book = await this.prisma.books.findUnique({
      where: { id: bookId },
    });

    if (!book) return null;

    const originalPrice = Number(book.price);
    let bestPrice = originalPrice;

    // Check each promotion and find the best price
    for (const promotion of activePromotions) {
      let discountRate = 0;
      let discountAmount = 0;

      // Handle different promotion types
      if (promotion.discount_rate) {
        // Normal promotion
        discountRate = Number(promotion.discount_rate);
      } else if (promotion.discount_amount) {
        // Normal promotion with fixed amount
        discountAmount = Number(promotion.discount_amount);
      } else if (promotion.PromotionShockDeal) {
        // Shock deal promotion
        discountRate = Number(promotion.discount_rate) || 0;
        discountAmount = Number(promotion.discount_amount) || 0;
      }

      // Calculate discounted price
      let discountedPrice = originalPrice;
      if (discountRate > 0) {
        discountedPrice = originalPrice - originalPrice * (discountRate / 100);
      } else if (discountAmount > 0) {
        discountedPrice = Math.max(0, originalPrice - discountAmount);
      }

      // Keep the lowest price
      if (discountedPrice < bestPrice) {
        bestPrice = discountedPrice;
      }
    }

    return bestPrice;
  }
}
