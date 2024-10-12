import { BadRequestException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from 'src/module/prisma/prisma.service';
import { ROLE } from 'src/utils/constants';

type TCreateUserWithEmail = {
  email: string;
  hashedPassword: string;
  fullName: string;
};
type TCreateUserWithPhone = {
  phone: string;
  hashedPassword: string;
  fullName: string;
};

export const createUserWithEmail = async (
  data: TCreateUserWithEmail,
  prismaService: PrismaService,
) => {
  const { email, fullName, hashedPassword } = data;
  const new_user = await prismaService.users.create({
    data: {
      email: email,
      full_name: fullName,
      password: hashedPassword,
      role: Role.CUSTOMER,
    },
  });
  const user_verification = await prismaService.vertifications.findFirst({
    where: {
      user_id: new_user.id,
    },
  });
  if (user_verification && !user_verification.is_active) {
    throw new BadRequestException(
      'We had sent a verification email to your email, please check your email to verify your account',
    );
  }
  return {
    ...new_user,
  };
};
