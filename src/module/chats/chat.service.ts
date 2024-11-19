import { HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import HttpStatusCode from 'src/utils/HttpStatusCode';
import { GetAllChatDto } from './dto/get-all-chat.dto';

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}
  async createChat(userId: string) {
    try {
      const existingChat = await this.prisma.chats.findFirst({
        where: {
          user_id: userId,
        },
      });
      if (existingChat) {
        throw new HttpException(
          'Chat already exists',
          HttpStatusCode.BAD_REQUEST,
        );
      }
      const chat = await this.prisma.chats.create({
        data: {
          user_id: userId,
        },
      });
      return chat;
    } catch (error) {
      throw new HttpException(
        error.message,
        HttpStatusCode.INTERNAL_SERVER_ERROR,
      );
    }
  }
  async getChatByAdmin(query: GetAllChatDto) {
    try {
      const chats = await this.prisma.chats.findMany({
        include: {
          LatestMessage: true,
        },
        take: query.take,
        skip: query.skip,
        orderBy: {
          LatestMessage: {
            created_at: 'desc',
          },
        },
      });
      const total = await this.prisma.chats.count();
      return { chats, total };
    } catch (error) {
      throw new HttpException(
        error.message,
        HttpStatusCode.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
