import { BadRequestException, Injectable, Param } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { isEmailExist } from './helpers';
import { hashedPassword } from '../auth/services/signup/hash-password';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}
  async findAll() {}
  async createNewUser(body: CreateUserDto) {
    if (isEmailExist(body.email)) {
      throw new BadRequestException('Email already exists', {
        cause: new Error('User already exist'),
      });
    }
    const hashPassword = await hashedPassword(body.password);
    const newUser = await this.prisma.users.create({
      data: {
        email: body.email,
        password: hashPassword,
        full_name: body.fullName,
        role: body.role,
      },
    });
    return newUser;
  }
  async findUserById(id: string) {
    const user = await this.prisma.users.findUnique({
      where: { id: id },
    });
    return user;
  }
  async disableUserById(id: string) {
    const user = await this.prisma.users.update({
      where: { id: id },
      data: {
        is_disable: true,
      },
    });
    return user;
  }
}
