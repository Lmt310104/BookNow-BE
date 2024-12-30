import { TypeEmail } from '@prisma/client';
import { PrismaService } from 'src/module/prisma/prisma.service';

export const checkIsExistEmail = async (
  email: string,
  prisma: PrismaService,
) => {
  const user = await prisma.users.findFirst({
    where: {
      email: email,
      type_email: TypeEmail.GOOGLE,
    },
  });
  return !!user;
};
export const checkIsExistPhoneNumber = async (
  phone: string,
  prisma: PrismaService,
) => {
  const user = await prisma.users.findUnique({
    where: {
      phone: phone,
    },
  });
  return !!user;
};
