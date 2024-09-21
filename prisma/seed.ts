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
      userName: 'admin123',
      password: hashedPasswordAdmin,
      role: 'ADMIN',
    },
  });
  await prisma.users.create({
    data: {
      email: 'customer@gmail.com',
      userName: 'customer123',
      password: hashedPasswordCustomer,
      role: 'CUSTOMER',
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
