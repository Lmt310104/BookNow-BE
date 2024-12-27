import { Module } from '@nestjs/common';
import { StreamChatController } from './stream-chat.controller';
import { StreamChatService } from './stream-chat.service';
import { PrismaModule } from '../prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  controllers: [StreamChatController],
  providers: [StreamChatService],
  imports: [PrismaModule, ConfigModule],
})
export class StreamChatModule {}
