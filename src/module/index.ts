import { AuthModule } from './auth/auth.module';
import { AuthorsModule } from './authors/authors.module';
import { BooksModule } from './books/books.module';
import { CartItemsModule } from './cart-items/cart-items.module';
import { CartsModule } from './carts/carts.module';
import { CategoriesModule } from './categories/categories.module';
import { EmailModule } from './email/email.module';
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
];

export default Modules;
