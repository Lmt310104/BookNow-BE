import { Controller, Get } from '@nestjs/common';
import {
  TUserSession,
  UserSession,
} from 'src/common/decorators/user-session.decorator';
import { StreamChatService } from './stream-chat.service';
import { END_POINTS } from 'src/utils/constants';

const {
  STREAM_CHAT: { BASE, GET_TOKEN },
} = END_POINTS;

@Controller(BASE)
export class StreamChatController {
  constructor(private readonly service: StreamChatService) {}
  @Get(GET_TOKEN)
  async getChatToken(@UserSession() user: TUserSession) {
    const token = await this.service.creatToken(user.id);
    return { token };
  }
}
