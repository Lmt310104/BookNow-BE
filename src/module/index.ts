import { AddressModule } from './address/v1/address.module';
import { AddressModuleV2 } from './address/v2/address.module';
import { AuthModule } from './auth/auth.module';
import { AuthorsModule } from './authors/authors.module';
import { BooksModule } from './books/books.module';
import { CartItemsModule } from './cart-items/cart-items.module';
import { CartsModule } from './carts/carts.module';
import { CategoriesModule } from './categories/categories.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { EmailModule } from './email/email.module';
import { EventsModule } from './events_gateway/event_gateway.module';
import { GeminiModule } from './gemini/gemini.module';
import { GoogleOauthModule } from './google-oauth/google-oauth.module';
import { GroupBuyModule } from './group-buy/group-buy.module';
import { HealthCheckModule } from './health_check/health_check.module';
import { DeliveryModule } from './intelligence_delivery/delivery.module';
import { InventoryModule } from './inventory/inventory.module';
import { OpenAIModule } from './openai/openai.module';
import { OrdersModule } from './orders/orders.module';
import { PromotionModule } from './promotion/promotion.module';
import { RecommendationModule } from './recommendation/recommendation.module';
import { ReviewsModule } from './reviews/reviews.module';
import { StatisticModule } from './statistic/statistic.module';
import { StreamChatModule } from './stream-chat/stream-chat.module';
import { SupplierModule } from './supplier/supplier.module';
import { UsersModule } from './users/users.module';
import { WebhookModule } from './webhook/webhook.module';
const Modules = [
  AuthorsModule,
  EmailModule,
  UsersModule,
  GeminiModule,
  BooksModule,
  AuthModule,
  CategoriesModule,
  CartsModule,
  CartItemsModule,
  OrdersModule,
  DashboardModule,
  GoogleOauthModule,
  ReviewsModule,
  AddressModule,
  StatisticModule,
  EventsModule,
  WebhookModule,
  StreamChatModule,
  OpenAIModule,
  SupplierModule,
  InventoryModule,
  PromotionModule,
  RecommendationModule,
  GroupBuyModule,
  AddressModuleV2,
  DeliveryModule,
  HealthCheckModule,
];

export default Modules;
