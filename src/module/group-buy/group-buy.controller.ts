import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
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
import { CheckoutGroupOrderDto } from './dto/checkout-group-order.dto';

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
    @Body() body: CheckoutGroupOrderDto,
  ) {
    return new StandardResponse(
      await this.groupBuyService.checkOutGroupOrder(
        currentUser.id,
        group_id,
        body,
      ),
      'Update group status successfully',
      200,
    );
  }

  @Post(':group_id/confirm-order')
  async confirmOrder(
    @Param('group_id', ParseUUIDPipe) group_id: string,
    @UserSession() currentUser: TUserSession,
  ) {
    return new StandardResponse(
      await this.groupBuyService.confirmOrder(currentUser.id, group_id),
      'Confirm order successfully',
      200,
    );
  }

  @Post(':group_id/kick-out-group-member/:member_id')
  async kickOutGroupMember(
    @Param('group_id', ParseUUIDPipe) group_id: string,
    @Param('member_id', ParseUUIDPipe) member_id: string,
    @UserSession() currentUser: TUserSession,
  ) {
    return new StandardResponse(
      await this.groupBuyService.kickOutGroupMember(
        currentUser.id,
        group_id,
        member_id,
      ),
      'Kick out group member successfully',
      200,
    );
  }

  @Delete(':group_id/delete-book/:item_id')
  async deleteBookFromCart(
    @Param('group_id', ParseUUIDPipe) group_id: string,
    @Param('item_id', ParseUUIDPipe) item_id: string,
    @UserSession() currentUser: TUserSession,
  ) {
    // return new StandardResponse(
    //   await this.groupBuyService.deleteBookFromGroupBasket(
    //     currentUser.id,
    //     group_id,
    //     item_id,
    //   ),
    //   'Delete book from group basket successfully',
    //   200,
    // );
  }

  @Get(':group_id/group-status')
  async getGroupStatus(
    @Param('group_id', ParseUUIDPipe) group_id: string,
    @UserSession() currentUser: TUserSession,
  ) {
    // return new StandardResponse(
    //   await this.groupBuyService.getGroupStatus(currentUser.id, group_id),
    //   'Get group status successfully',
    //   200,
    // );
  }
}
