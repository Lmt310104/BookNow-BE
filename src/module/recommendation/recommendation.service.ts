import { PrismaService } from '@module/prisma/prisma.service';
import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RecombeeProvider } from 'src/common/providers/recombeeAI.provider';

@Injectable()
export class RecommendationService {
  constructor(
    @Inject('RECOMBEEAI') private readonly recombeeProvider: RecombeeProvider,
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}
  async recommendBooks(userId, searchQuery, limit = 20, page = 1) {
    try {
      let recommendations = null;
      if (searchQuery) {
        const req = new this.recombeeProvider.rqs.SearchItems(
          userId.toString(),
          searchQuery,
          limit,
          {
            scenario: 'book_recommendation',
            cascadeCreate: true,
            returnProperties: true,
          },
        );
        req.timeout = 10000;
        recommendations = await this.recombeeProvider.client.send(req);
      } else {
        const req = new this.recombeeProvider.rqs.RecommendItemsToUser(
          userId.toString(),
          limit,
          {
            scenario: 'book_recommendation',
            cascadeCreate: true,
            returnProperties: true,
          },
        );
        req.timeout = 10000;
        recommendations = await this.recombeeProvider.client.send(req);
        recommendations.recomms = (
          await Promise.all(
            recommendations.recomms.map(async (item) => {
              const book = await this.prisma.books.findUnique({
                where: { id: item.id },
                include: {
                  PromotionComboProduct: {
                    include: {
                      PromotionCombo: {
                        include: {
                          Promotion: true,
                          PromotionComboCondition: true,
                        },
                      },
                    },
                  },
                  PromotionNormalDetail: {
                    include: {
                      Promotion: true,
                    },
                  },
                  PromotionShockDealBook: {
                    include: {
                      PromotionShockDeal: {
                        include: {
                          Promotion: true,
                          PromotionShockDealCondition: true,
                        },
                      },
                    },
                  },
                },
              });

              if (!book) return null;

              return {
                ...book,
                PromotionComboProduct: book.PromotionComboProduct?.filter(
                  (pcp) => pcp?.PromotionCombo?.Promotion?.is_active,
                ),
                PromotionNormalDetail: book.PromotionNormalDetail?.filter(
                  (pnd) => pnd?.Promotion?.is_active,
                ),
                PromotionShockDealBook: book.PromotionShockDealBook?.filter(
                  (psd) => psd?.PromotionShockDeal?.Promotion?.is_active,
                ),
              };
            }),
          )
        ).filter(Boolean);
        return recommendations;
      }
      return recommendations;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Có lỗi xảy ra trong hệ thống');
    }
  }
  async getSimilarBooks(bookId, userId, limit = 20, page = 1) {
    try {
      let recommendations = null;
      const req = new this.recombeeProvider.rqs.RecommendItemsToItem(
        bookId,
        userId,
        limit,
        {
          scenario: 'books_similar',
          cascadeCreate: true,
        },
      );
      req.timeout = 10000;
      recommendations = await this.recombeeProvider.client.send(req);
      recommendations = await Promise.all(
        recommendations.recomms.map(async (item) => {
          const book = await this.prisma.books.findUnique({
            where: { id: item.id },
            include: {
              Category: true,
              PromotionComboProduct: {
                include: {
                  PromotionCombo: {
                    include: {
                      Promotion: true,
                      PromotionComboCondition: true,
                    },
                  },
                },
              },
              PromotionNormalDetail: {
                include: {
                  Promotion: true,
                },
              },
              PromotionShockDealBook: {
                include: {
                  PromotionShockDeal: {
                    include: {
                      Promotion: true,
                      PromotionShockDealCondition: true,
                    },
                  },
                },
              },
            },
          });
          if (!book) return {};
          return {
            ...book,
            PromotionComboProduct: book?.PromotionComboProduct?.filter(
              (pcp) => pcp.PromotionCombo?.Promotion?.is_active ?? [],
            ),
            PromotionNormalDetail: book?.PromotionNormalDetail?.filter(
              (pnd) => pnd.Promotion?.is_active ?? [],
            ),
            PromotionShockDealBook: book?.PromotionShockDealBook?.filter(
              (psd) => psd.PromotionShockDeal?.Promotion?.is_active ?? [],
            ),
          };
        }),
      );
      const cleaned = recommendations.filter(
        (item) => item && Object.keys(item).length > 0,
      );
      return cleaned;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Có lỗi xảy ra trong hệ thống');
    }
  }
  async addBookToRecombee(book: any) {
    try {
      const req = new this.recombeeProvider.rqs.SetItemValues(
        book.id.toString(),
        {
          title: book.title,
          description: book.description,
          author: book.author,
          price: book.price,
          rating: book.avg_stars,
          totalReview: book.total_reviews,
          soldQuantity: book.sold_quantity,
          imageLink: book.image_url,
          category: book.Category.name,
          url: `${this.config.get<string>('url_web')}/book/${book.id}`,
          onSale: `${book.PromotionBook || book.PromotionShockDealCondition ? true : false}`,
        },
        {
          cascadeCreate: true,
        },
      );
      req.timeout = 10000;
      await this.recombeeProvider.client.send(req);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Có lỗi xảy ra trong hệ thống');
    }
  }
  async sendIneraction() {}
  async addUserToRecombee(user: any) {
    try {
      const req = new this.recombeeProvider.rqs.SetUserValues(
        user.id.toString(),
        {
          gender: user.gender,
          hobbies: user.hobbies,
          age: user.age,
          purchase_history: user.purchase_history,
        },
        {
          cascadeCreate: true,
        },
      );
      req.timeout = 20000;
      await this.recombeeProvider.client.send(req);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Có lỗi xảy ra trong hệ thống');
    }
  }
  async updateBookToRecombee(book: any) {
    await this.addBookToRecombee(book);
  }
  async updateUserToRecombee(user: any) {
    await this.addUserToRecombee(user);
  }

  async addEntityPropertiesToRecombee() {
    try {
      const addTitleProperty = new this.recombeeProvider.rqs.AddItemProperty(
        'title',
        'string',
      );
      const addDescriptionProperty =
        new this.recombeeProvider.rqs.AddItemProperty('description', 'string');
      const addAuthorProperty = new this.recombeeProvider.rqs.AddItemProperty(
        'author',
        'string',
      );
      const addCategoryProperty = new this.recombeeProvider.rqs.AddItemProperty(
        'category',
        'string',
      );
      const addPriceProperty = new this.recombeeProvider.rqs.AddItemProperty(
        'price',
        'double',
      );
      const addRatingProperty = new this.recombeeProvider.rqs.AddItemProperty(
        'rating',
        'double',
      );
      const addTotalReviewProperty =
        new this.recombeeProvider.rqs.AddItemProperty('totalReview', 'int');
      const addSoldQuantityProperty =
        new this.recombeeProvider.rqs.AddItemProperty('soldQuantity', 'int');
      const addImageLinkProperty =
        new this.recombeeProvider.rqs.AddItemProperty('imageLink', 'imageList');
      const addUrlProperty = new this.recombeeProvider.rqs.AddItemProperty(
        'url',
        'string',
      );
      const addOnSaleProperty = new this.recombeeProvider.rqs.AddItemProperty(
        'onSale',
        'boolean',
      );

      await this.recombeeProvider.client.send(addTitleProperty);
      await this.recombeeProvider.client.send(addDescriptionProperty);
      await this.recombeeProvider.client.send(addAuthorProperty);
      await this.recombeeProvider.client.send(addCategoryProperty);
      await this.recombeeProvider.client.send(addPriceProperty);
      await this.recombeeProvider.client.send(addRatingProperty);
      await this.recombeeProvider.client.send(addTotalReviewProperty);
      await this.recombeeProvider.client.send(addSoldQuantityProperty);
      await this.recombeeProvider.client.send(addImageLinkProperty);
      await this.recombeeProvider.client.send(addUrlProperty);
      await this.recombeeProvider.client.send(addOnSaleProperty);

      console.log('Successfully added entity properties to Recombee');
    } catch (error) {
      console.log(error);
      throw new Error(error.message);
    }
  }

  async addUserPropertiesToRecombee() {
    try {
      const properties = [
        new this.recombeeProvider.rqs.AddUserProperty('gender', 'string'),
        new this.recombeeProvider.rqs.AddUserProperty('hobbies', 'set'),
        new this.recombeeProvider.rqs.AddUserProperty('age', 'int'),
        new this.recombeeProvider.rqs.AddUserProperty('location', 'string'),
        new this.recombeeProvider.rqs.AddUserProperty(
          'purchase_history',
          'set',
        ),
        new this.recombeeProvider.rqs.AddUserProperty(
          'preferred_categories',
          'set',
        ),
        new this.recombeeProvider.rqs.AddUserProperty(
          'preferred_authors',
          'set',
        ),
        new this.recombeeProvider.rqs.AddUserProperty(
          'preferred_publishers',
          'set',
        ),
        new this.recombeeProvider.rqs.AddUserProperty(
          'preferred_languages',
          'set',
        ),
      ];

      for (const property of properties) {
        await this.recombeeProvider.client.send(property);
      }

      console.log('User properties added successfully');
    } catch (error) {
      console.log(error);
      throw new Error(error.message);
    }
  }
  async trackAddToCart(userId: string, bookId: string) {
    try {
      const req = new this.recombeeProvider.rqs.AddCartAddition(
        userId.toString(),
        bookId.toString(),
        {
          timestamp: new Date().toISOString(),
          cascadeCreate: true,
          amount: 1,
        },
      );

      req.timeout = 10000;
      await this.recombeeProvider.client.send(req);

      console.log(
        `Tracked cart addition: User ${userId} added book ${bookId} to cart`,
      );
      return true;
    } catch (error) {
      console.error('Error tracking cart addition:', error);
      return false;
    }
  }
  async trackPurchase(
    userId: string,
    bookId: string,
    price: number,
    quantity: number = 1,
  ) {
    try {
      const req = new this.recombeeProvider.rqs.AddPurchase(
        userId.toString(),
        bookId.toString(),
        {
          timestamp: new Date().toISOString(),
          cascadeCreate: true,
          price: price,
          amount: quantity,
        },
      );

      req.timeout = 10000;
      await this.recombeeProvider.client.send(req);

      console.log(`Tracked purchase: User ${userId} purchased book ${bookId}`);
      return true;
    } catch (error) {
      console.error('Error tracking purchase:', error);
      return false;
    }
  }
  async trackDetailView(userId: string, bookId: string) {
    try {
      const req = new this.recombeeProvider.rqs.AddDetailView(
        userId.toString(),
        bookId.toString(),
        {
          timestamp: new Date().toISOString(),
          cascadeCreate: true,
          duration: 30, // Assumed view duration in seconds
        },
      );

      req.timeout = 10000;
      await this.recombeeProvider.client.send(req);

      console.log(`Tracked detail view: User ${userId} viewed book ${bookId}`);
      return true;
    } catch (error) {
      console.error('Error tracking detail view:', error);
      // Non-critical failure - don't block page viewing
      return false;
    }
  }
  async trackRating(userId: string, bookId: string, rating: number) {
    try {
      const normalizedRating = Math.min(Math.max(rating, 1), 5);
      const req = new this.recombeeProvider.rqs.AddRating(
        userId.toString(),
        bookId.toString(),
        normalizedRating,
        {
          timestamp: new Date().toISOString(),
          cascadeCreate: true,
        },
      );
      req.timeout = 10000;
      await this.recombeeProvider.client.send(req);

      console.log(
        `Tracked rating: User ${userId} rated book ${bookId} with ${normalizedRating} stars`,
      );
      return true;
    } catch (error) {
      console.error('Error tracking rating:', error);
      return false;
    }
  }

  async trackBulkPurchases(
    userId: string,
    items: Array<{ bookId: string; price: number; quantity: number }>,
  ) {
    try {
      const timestamp = new Date().toISOString();
      const requests = items.map((item) => {
        return new this.recombeeProvider.rqs.AddPurchase(
          userId.toString(),
          item.bookId.toString(),
          {
            timestamp: timestamp,
            cascadeCreate: true,
            price: item.price,
            amount: item.quantity,
            profit: item.price * 0.3,
          },
        );
      });

      const batch = new this.recombeeProvider.rqs.Batch(requests);
      batch.timeout = 20000;

      await this.recombeeProvider.client.send(batch);
      console.log(
        `Tracked bulk purchase: User ${userId} purchased ${items.length} books`,
      );

      return true;
    } catch (error) {
      console.error('Error tracking bulk purchases:', error);
      return false;
    }
  }
  async addDetailView(
    userId: string,
    bookId: string,
    recommendationId?: string,
  ) {
    try {
      const options: any = {
        timestamp: new Date().toISOString(),
        cascadeCreate: true,
        duration: 30, // Assumed 30 seconds view time
      };

      // Add recommendation ID if it's from a recommendation click
      if (recommendationId) {
        options.recommId = recommendationId;
      }

      const req = new this.recombeeProvider.rqs.AddDetailView(
        userId.toString(),
        bookId.toString(),
        options,
      );

      req.timeout = 10000;
      await this.recombeeProvider.client.send(req);

      console.log(
        `Tracked detail view: User ${userId} viewed book ${bookId}${
          recommendationId ? ` from recommendation ${recommendationId}` : ''
        }`,
      );
      return true;
    } catch (error) {
      console.error('Error tracking detail view:', error);
      return false;
    }
  }
}
