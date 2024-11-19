import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { END_POINTS } from 'src/utils/constants';
import { MessageService } from './message.service';
import { GetAllMessage } from './dto/get-message.dto';
import { PageResponseMetaDto } from 'src/utils/page-response-meta.dto';
import { PageResponseDto } from 'src/utils/page-response.dto';
import {
  TUserSession,
  UserSession,
} from 'src/common/decorators/user-session.decorator';
import { CreateMessageDto } from './dto/create-message.dto';
import { StandardResponse } from 'src/utils/response.dto';

const {
  MESSAGES: { BASE, GET_LATEST_MESSAGE_BY_CHAT, GET_CHAT_BY_USER, CREATE },
} = END_POINTS;
@Controller(BASE)
export class MessagesController {
  constructor(private readonly messagesService: MessageService) {}
  @Get(GET_LATEST_MESSAGE_BY_CHAT)
  async getLatestMessageByChat(
    @Param('chatId') chatId: string,
    @Query() query: GetAllMessage,
  ) {
    const { messages, count } =
      await this.messagesService.getLatestMessageByChat(chatId, query);
    const pageResponse = new PageResponseMetaDto({
      pageOptionsDto: query,
      itemCount: count,
    });
    return new PageResponseDto(messages, pageResponse);
  }
  @Get(GET_CHAT_BY_USER)
  async getAllUnreadMessagesByUser(@UserSession() user: TUserSession) {
    const numOfUnreadMessage =
      await this.messagesService.getUnreadMessagesByUser(user.id);
    return numOfUnreadMessage;
  }
  @Post(CREATE)
  async createMessage(
    @Param('chatId') chatId: string,
    @Body() body: CreateMessageDto,
    @UserSession() user: TUserSession,
  ) {
    const message = await this.messagesService.createMessage(
      body,
      chatId,
      user.id,
    );
    return new StandardResponse(message, 'Message created successfully', 200);
  }
}
