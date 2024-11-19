import { Controller, Get, Post, Query } from '@nestjs/common';
import { END_POINTS } from 'src/utils/constants';
import { ChatService } from './chat.service';
import { GetAllChatDto } from './dto/get-all-chat.dto';
import { PageResponseMetaDto } from 'src/utils/page-response-meta.dto';
import { PageResponseDto } from 'src/utils/page-response.dto';
import {
  TUserSession,
  UserSession,
} from 'src/common/decorators/user-session.decorator';
import { StandardResponse } from 'src/utils/response.dto';
import HttpStatusCode from 'src/utils/HttpStatusCode';

const {
  CHATS: { BASE, GET_ALL_BY_ADMIN, CREATE },
} = END_POINTS;

@Controller(BASE)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}
  @Get(GET_ALL_BY_ADMIN)
  async getAllChatsByAdmin(@Query() query: GetAllChatDto): Promise<any> {
    const { chats, total } = await this.chatService.getChatByAdmin(query);
    const pageResponseMetaDtp = new PageResponseMetaDto({
      pageOptionsDto: query,
      itemCount: total,
    });
    return new PageResponseDto(chats, pageResponseMetaDtp);
  }
  @Post(CREATE)
  async createChat(@UserSession() user: TUserSession): Promise<any> {
    const chat = await this.chatService.createChat(user.id);
    return new StandardResponse(
      chat,
      'Chat created successfully',
      HttpStatusCode.CREATED,
    );
  }
}
