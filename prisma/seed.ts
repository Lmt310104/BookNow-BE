import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
const prisma = new PrismaClient();

export const hashPassword = async (password: string) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};
async function main() {
  const hashedPasswordAdmin = await hashPassword('admin123');
  const hashedPasswordCustomer = await hashPassword('customer123');
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
}
main()
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  })
  .finally(async () => {
    console.log('Seeding done!');
    await prisma.$disconnect();
  });
