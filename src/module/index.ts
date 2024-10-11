import { AuthModule } from './auth/auth.module';
import { AuthorsModule } from './authors/authors.module';
import { BooksModule } from './books/books.module';
import { CartItemsModule } from './cart-items/cart-items.module';
import { CartsModule } from './carts/carts.module';
import { CategoriesModule } from './categories/categories.module';
import { EmailModule } from './email/email.module';
import { UploadModule } from './upload/upload.module';
import { UsersModule } from './users/users.module';
const Modules = [
  AuthorsModule,
  EmailModule,
  UsersModule,
  BooksModule,
  UploadModule,
  AuthModule,
  CategoriesModule,
  CartsModule,
  CartItemsModule,
];

export default Modules;
