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
    private readonly config: ConfigService,
  ) {}
  async recommendBooks(userId, searchQuery, limit = 10, page = 1) {
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
          returnProperties: true,
        },
      );
      req.timeout = 10000;
      recommendations = await this.recombeeProvider.client.send(req);
      return recommendations;
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
          age: new Date().getFullYear() - user.birthday.getFullYear(),
          purchase_history: user.purchase_history,
        },
        {
          cascadeCreate: true,
        },
      );
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
    await this.updateUserToRecombee(user);
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
      const addGenderProperty = new this.recombeeProvider.rqs.AddItemProperty(
        'gender',
        'string',
      );
      const addHobbiesProperty = new this.recombeeProvider.rqs.AddItemProperty(
        'hobbies',
        'string',
      );
      const addAgeProperty = new this.recombeeProvider.rqs.AddUserProperty(
        'age',
        'int',
      );
      const addLocationProperty = new this.recombeeProvider.rqs.AddUserProperty(
        'location',
        'string',
      );
      const addPurchaseHistoryProperty =
        new this.recombeeProvider.rqs.AddUserProperty(
          'purchase_history',
          'set',
        );

      await this.recombeeProvider.client.send(addHobbiesProperty);
      await this.recombeeProvider.client.send(addAgeProperty);
      await this.recombeeProvider.client.send(addGenderProperty);
      await this.recombeeProvider.client.send(addLocationProperty);
      await this.recombeeProvider.client.send(addPurchaseHistoryProperty);

      console.log('User properties added successfully');
    } catch (error) {
      console.log(error);
      throw new Error(error.message);
    }
  }
}
