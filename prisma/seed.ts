import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
const prisma = new PrismaClient();

export const hashPassword = async (password: string) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};
import { faker } from '@faker-js/faker';
import authors_data from './seeds/authors';
import category_data from './seeds/categories';
async function main() {
  /**
   * Neccessary to hash the password before seeding
   * Neccessary seeds: authors, categories, books, carts, orders, comments
   */
  const transform_author = authors_data.map((author) => ({
    name: author.name,
    birthday: author.birthday.toISOString(),
    description: author.description,
  }));
  await prisma.authors.createMany({
    data: transform_author,
    skipDuplicates: true,
  });
  await prisma.category.createMany({
    data: category_data,
  });
  const hashedPasswordAdmin = await hashPassword('admin123');
  const hashedPasswordCustomer = await hashPassword('customer123');
  const hashedPasswordTestUser = await hashPassword('testuser123');
  await prisma.users.create({
    data: {
      email: 'admin@gmail.com',
      password: hashedPasswordAdmin,
      role: 'ADMIN',
      phone: '0896423104',
      full_name: 'Admin',
      verification: {
        create: {
          is_active: true,
          verified_code: hashedPasswordAdmin,
        },
      },
    },
  });
  await prisma.users.create({
    data: {
      email: 'customer@gmail.com',
      password: hashedPasswordCustomer,
      role: 'CUSTOMER',
      phone: '0763769185',
      full_name: 'Customer',
      verification: {
        create: {
          is_active: true,
          verified_code: hashedPasswordCustomer,
        },
      },
    },
  });
  for (let i = 0; i < 100; i++) {
    await prisma.users.create({
      data: {
        email: faker.internet.email(),
        password: hashedPasswordTestUser,
        role: Role.CUSTOMER,
        phone: faker.phone.number({ style: 'national' }),
        full_name: faker.internet.userName(),
        verification: {
          create: {
            is_active: true,
            verified_code: hashedPasswordTestUser,
          },
        },
      },
    });
  }
}
// main()
//   .catch(async (e) => {
//     console.error(e);
//     await prisma.$disconnect();
//     process.exit(1);
//   })
//   .finally(async () => {
//     console.log('Seeding done!');
//     await prisma.$disconnect();
//   });
