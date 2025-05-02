import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { END_POINTS } from 'src/utils/constants';
import { GroupBuyService } from './group-buy.service';
import {
  TUserSession,
  UserSession,
} from 'src/common/decorators/user-session.decorator';
import { StandardResponse } from 'src/utils/response.dto';
import { ApiOperation } from '@nestjs/swagger';
import { AddBookToGroupBasketDto } from './dto/add-book-to-group-basket.dto';
import { UpdateGroupItemBookDto } from './dto/update-group-item-book.dto';
import { UpdateGroupStatusDto } from './dto/update-group-status.dto';
import { CreateGroupOrderDto } from './dto/create-group-order.dto';

const {
  GROUP_BUY: {
    BASE,
    CREATE_GROUP,
    CREATE_GROUP_ORDER,
    ADD_BOOK_TO_GROUP,
    UPDATE_GROUP_STATUS,
    UPDATE_BOOK,
    DELETE_BOOK,
    JOIN_GROUP,
    GET_GROUP_BASKET,
  },
} = END_POINTS;
@Controller(BASE)
export class GroupBuyController {
  constructor(private readonly groupBuyService: GroupBuyService) {}
  @Post(CREATE_GROUP)
  @ApiOperation({
    summary: 'Create a new group',
    description:
      'This endpoint allows the user to create a new group with a name, description, and optional list of members.',
  })
  async createNewGroupBuyOrder(@UserSession() currentUser: TUserSession) {
    return new StandardResponse(
      await this.groupBuyService.createNewGroup(currentUser.id),
      'Group created successfully',
      201,
    );
  }

  @Post(JOIN_GROUP)
  async joinGroup(
    @UserSession() currentUser: TUserSession,
    @Param('group_id', ParseUUIDPipe) group_id: string,
  ) {
    return new StandardResponse(
      await this.groupBuyService.joinGroup(currentUser.id, group_id),
      'You joined group',
      200,
    );
  }
  @Post(ADD_BOOK_TO_GROUP)
  async addBookToGroup(
    @UserSession() currentUser: TUserSession,
    @Param('group_id', ParseUUIDPipe) group_id: string,
    @Body() body: AddBookToGroupBasketDto,
  ) {
    return new StandardResponse(
      await this.groupBuyService.addBookToGroupBasket(
        currentUser.id,
        group_id,
        body,
      ),
      'Add book to group basket successfully',
      201,
    );
  }

  @Get(GET_GROUP_BASKET)
  async getGroupBasket(@Param('group_id', ParseUUIDPipe) group_id: string) {
    return new StandardResponse(
      await this.groupBuyService.getGroupBasket(group_id),
      'Add book to group basket successfully',
      201,
    );
  }

  @Put(UPDATE_BOOK)
  async updateBookQuantityInGroupBasket(
    @Param('group_id', ParseUUIDPipe) group_id: string,
    @UserSession() currentUser: TUserSession,
    @Body() body: UpdateGroupItemBookDto,
  ) {
    return new StandardResponse(
      await this.groupBuyService.updateBookInGroupBasket(
        currentUser.id,
        group_id,
        body,
      ),
      'Update book quantity in group basket successfully',
      200,
    );
  }

  @Put(UPDATE_GROUP_STATUS)
  async updateGroupStatus(
    @Param('group_id', ParseUUIDPipe) group_id: string,
    @UserSession() currentUser: TUserSession,
    @Body() body: UpdateGroupStatusDto,
  ) {
    return new StandardResponse(
      await this.groupBuyService.updateGroupStatus(
        currentUser.id,
        group_id,
        body,
      ),
      'Update group status successfully',
      200,
    );
  }

  @Post(CREATE_GROUP_ORDER)
  async checkOutGroupCart(
    @Param('group_id', ParseUUIDPipe) group_id: string,
    @UserSession() currentUser: TUserSession,
    @Body() body: CreateGroupOrderDto,
  ) {
    return new StandardResponse(
      await this.groupBuyService.createGroupOrder(
        currentUser.id,
        group_id,
        body,
      ),
      'Update group status successfully',
      200,
    );
  }

  @Get('test-goship-sdk')
  async testGoShipSDK() {
    return new StandardResponse(
      await this.groupBuyService.testGoShipIntegration(),
      'Update group status successfully',
      200,
    );
  }
}
