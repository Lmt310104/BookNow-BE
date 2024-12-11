import { OnModuleInit } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMessageSocketDto } from './dto/create-message-socket.dto';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}
  @WebSocketServer()
  server: Server;
  onModuleInit() {
    this.server.on('connection', (socket) => {
      const userId = socket.handshake.query.userId;
      const chatId = socket.handshake.query.chatId;
      if (userId && chatId) {
        socket.join(chatId);
      }
      console.log('userId: ', userId);
      console.log('chatId: ', chatId);
      socket.on('userConnected', async (user) => {
        console.log('userConnected ehhehehe');
        console.log(user);
      });
      socket.on('disconnect', () => {
        console.log('disconnect');
        console.log('will emit onlineUsers (leave)', typeof userId);
      });
    });
  }
  @SubscribeMessage('sendMessage')
  async onSendMessage(
    @MessageBody() body: CreateMessageSocketDto,
    @ConnectedSocket() socket: any,
  ) {
    try {
      console.log('body: ', body);
      const now = new Date();
      const utc7Date = new Date(now.getTime() + 7 * 60 * 60 * 1000);
      const chatId = socket.handshake.query.chatId;
      const senderId = socket.handshake.query.userId;
      const result = await this.prisma.$transaction(async (tx) => {
        const newMessage = await tx.messages.create({
          data: {
            content: body.content,
            chat_id: chatId,
            sender_id: senderId,
            created_at: utc7Date,
            updated_at: utc7Date,
            ...(body.attachmentId && { attachment_id: body.attachmentId }),
          },
        });
        await tx.chats.update({
          where: {
            id: chatId,
          },
          data: {
            latest_message_id: newMessage.id,
            updated_at: utc7Date,
          },
        });
        return newMessage;
      });
      if (result) {
        this.server.to(chatId).emit('onMessage', {
          message: 'new message',
          data: result,
        });
      }
    } catch (err) {
      console.log(err);
    }
  }
}
