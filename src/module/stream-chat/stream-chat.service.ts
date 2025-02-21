import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StreamChat } from 'stream-chat';

@Injectable()
export class StreamChatService {
  private instance: StreamChat;

  constructor(private configService: ConfigService) {
    this.instance = new StreamChat(
      this.configService.get('STREAM_API_KEY'),
      this.configService.get('STREAM_API_SECRET'),
    );
  }

  async creatToken(userId: string) {
    return this.instance.createToken(userId);
  }
}
