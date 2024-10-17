import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { isEmailExist } from './helpers';
import { hashedPassword } from '../auth/services/signup/hash-password';
import { TUserSession } from 'src/common/decorators/user-session.decorator';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto.ts';

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
  async getAllUsers() {
    const users = await this.prisma.users.findMany();
    return users;
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
  async updateUserProfile(session: TUserSession, dto: UpdateUserProfileDto) {
    const user = await this.prisma.users.findUnique({
      where: { id: session.id },
    });
    if (!user) {
      throw new BadRequestException('User not found', {
        cause: new Error('User not found'),
      });
    }
    const updatedUser = await this.prisma.users.update({
      where: { id: session.id },
      data: {
        full_name: dto.fullName,
      },
    });
    return updatedUser;
  }
  async enableUserById(id: string) {
    const user = await this.prisma.users.findUnique({
      where: { id: id },
    });
    if (!user) {
      throw new BadRequestException('User not found', {
        cause: new Error('User not found'),
      });
    }
    const updatedUser = await this.prisma.users.update({
      where: { id: id },
      data: {
        is_disable: false,
      },
    });
    return updatedUser;
  }
}
