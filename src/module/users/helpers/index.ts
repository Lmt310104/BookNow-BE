import { TypeEmail } from '@prisma/client';
import { PrismaService } from 'src/module/prisma/prisma.service';

const prisma = new PrismaService();
export const isEmailExist = async (email: string) => {
  const user = await prisma.users.findFirst({
    where: { email: email, type_email: TypeEmail.NORMAL },
    select: { id: true },
  });
  return user ? true : false;
};
