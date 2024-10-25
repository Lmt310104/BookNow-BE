import { AuthModule } from './auth/auth.module';
import { AuthorsModule } from './authors/authors.module';
import { BooksModule } from './books/books.module';
import { CartItemsModule } from './cart-items/cart-items.module';
import { CartsModule } from './carts/carts.module';
import { CategoriesModule } from './categories/categories.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { EmailModule } from './email/email.module';
import { GoogleOauthModule } from './google-oauth/google-oauth.module';
import { OrdersModule } from './orders/orders.module';
import { UsersModule } from './users/users.module';
const Modules = [
  AuthorsModule,
  EmailModule,
  UsersModule,
  BooksModule,
  AuthModule,
  CategoriesModule,
  CartsModule,
  CartItemsModule,
  OrdersModule,
  DashboardModule,
  GoogleOauthModule,
];

export default Modules;
