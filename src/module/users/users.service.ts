import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { isEmailExist } from './helpers';
import { hashedPassword } from '../auth/services/signup/hash-password';
import { TUserSession } from 'src/common/decorators/user-session.decorator';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { GetAllUserDto } from './dto/get-all-user.dto';
import { EUploadFolder, USER_IMAGE_URL } from 'src/utils/constants';
import { uploadFilesFromFirebase } from 'src/services/files/upload';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}
  async createNewUser(body: CreateUserDto) {
    if (await isEmailExist(body.email)) {
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
        birthday: new Date(body.birthday),
        gender: body.gender,
        avatar_url: USER_IMAGE_URL,
        verification: {
          create: {
            verified_code: hashPassword,
            is_active: true,
          },
        },
      },
    });
    if (newUser.role === 'CUSTOMER') {
      await this.prisma.carts.create({
        data: {
          user_id: newUser.id,
        },
      });
    }
    return newUser;
  }
  async getAllUsers(query: GetAllUserDto) {
    const users = await this.prisma.users.findMany({
      where: {
        role: query.role,
      },
      skip: query.skip,
      take: query.take,
      orderBy: { [query.sortBy]: query.order },
    });
    const itemCount = await this.prisma.users.count({
      where: {
        role: query.role,
      },
    });
    return { users, itemCount };
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
  async updateUserProfile(
    session: TUserSession,
    dto: UpdateUserProfileDto,
    image?: Express.Multer.File,
  ) {
    let imageUrls = [];
    try {
      if (image && image.buffer.byteLength > 0) {
        const uploadImagesData = await uploadFilesFromFirebase(
          [image],
          EUploadFolder.user,
        );
        if (!uploadImagesData.success) {
          throw new Error('Failed to upload images!');
        }
        imageUrls = uploadImagesData.urls;
      }
      const user = await this.prisma.users.findUnique({
        where: { id: session.id },
      });
      if (!user) {
        throw new BadRequestException('User not found', {
          cause: new Error('User not found'),
        });
      }
      const { birthday, fullName, ...data } = dto;
      const updatedUser = await this.prisma.users.update({
        where: { id: session.id },
        data: {
          full_name: fullName,
          birthday: birthday ? new Date(birthday) : user.birthday,
          avatar_url: image ? imageUrls[0] : user.avatar_url,
          ...data,
        },
      });
      return updatedUser;
    } catch (error) {
      console.log(error);
      throw new BadRequestException('Failed to update user profile', {
        cause: error,
      });
    }
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
