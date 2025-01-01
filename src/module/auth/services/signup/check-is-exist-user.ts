import { TypeEmail, TypeUser } from '@prisma/client';
import { PrismaService } from 'src/module/prisma/prisma.service';

export const checkIsExistEmail = async (
  email: string,
  prisma: PrismaService,
) => {
  const user = await prisma.users.findFirst({
    where: {
      email: email,
      type_user: TypeUser.SYSTEM_CUSTOMER,
      type_email: TypeEmail.NORMAL,
    },
  });
  return !!user;
};
export const checkIsExistPhoneNumber = async (
  phone: string,
  prisma: PrismaService,
) => {
  const user = await prisma.users.findFirst({
    where: {
      phone: phone,
    },
  });
  return !!user;
};
