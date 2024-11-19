import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { PrismaService } from '../prisma/prisma.service';
import { MessagesController } from './message.controller';
import { MessageService } from './message.service';

@Module({
  imports: [PrismaModule],
  controllers: [MessagesController],
  providers: [PrismaService, MessageService],
})
export class MessagesModule {}
