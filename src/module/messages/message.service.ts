import { HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GetAllMessage } from './dto/get-message.dto';
import HttpStatusCode from 'src/utils/HttpStatusCode';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class MessageService {
  constructor(private readonly prisma: PrismaService) {}
  async getLatestMessageByChat(chatId: string, query: GetAllMessage) {
    try {
      const messages = await this.prisma.messages.findMany({
        where: {
          chat_id: chatId,
        },
        orderBy: { created_at: 'desc' },
        take: query.take,
        skip: query.skip,
      });
      const _count = await this.prisma.messages.aggregate({
        _count: {
          _all: true,
        },
        where: {
          chat_id: chatId,
        },
      });
      return { messages, count: _count._count._all };
    } catch (error) {
      throw new HttpException(error.message, HttpStatusCode.BAD_REQUEST);
    }
  }
  async getUnreadMessagesByUser(userId: string) {
    try {
      const userChat = await this.prisma.chats.findFirst({
        where: {
          user_id: userId,
        },
      });
      if (!userChat) {
        throw new HttpException('User not found', HttpStatusCode.NOT_FOUND);
      }
      const messages = await this.prisma.messages.findMany({
        where: {
          chat_id: userChat.id,
          is_read: false,
        },
      });
      return messages.length;
    } catch (error) {
      throw new HttpException(error.message, HttpStatusCode.BAD_REQUEST);
    }
  }
  async createMessage(body: CreateMessageDto, chatId: string, userId: string) {
    try {
      const message = await this.prisma.messages.create({
        data: {
          chat_id: chatId,
          sender_id: userId,
          content: body.content,
          attachment_id: body.attachmentId,
        },
      });
      return message;
    } catch (error) {
      throw new HttpException(error.message, HttpStatusCode.BAD_REQUEST);
    }
  }
}
