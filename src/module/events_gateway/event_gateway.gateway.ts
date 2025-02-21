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
}
