import { Inject, Injectable } from '@nestjs/common';
import { RecombeeProvider } from 'src/common/providers/recombeeAI.provider';

@Injectable()
export class RecommendationService {
  constructor(
    @Inject('RECOMBEEAI') private readonly recombeeProvider: RecombeeProvider,
  ) {}

  async recommendBooks() {}
  async recommendAuthors() {}
  async addBookToRecombee() {}
  async addAuthorToRecombee() {}
  async sendIneraction() {}
  async addUserToRecombee() {}
  async updateBookToRecombee() {}
  async updateAuthorToRecombee() {}
  async updateUserToRecombee() {}

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
