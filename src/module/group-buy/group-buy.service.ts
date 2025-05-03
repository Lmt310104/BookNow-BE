import { PrismaService } from '@module/prisma/prisma.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AddBookToGroupBasketDto } from './dto/add-book-to-group-basket.dto';
import { GroupStatus } from '@prisma/client';
import { UpdateGroupItemBookDto } from './dto/update-group-item-book.dto';
import { UpdateGroupStatusDto } from './dto/update-group-status.dto';
import { CreateGroupOrderDto } from './dto/create-group-order.dto';
import { GoshipSDKProvider } from 'src/common/providers/goship.provider';

@Injectable()
export class GroupBuyService {
  constructor(
    private readonly prisma: PrismaService,
    private configService: ConfigService,
    private readonly goshipProvider: GoshipSDKProvider,
  ) {}
  async getGroupBasket(group_id: string) {
    return await this.prisma.groups.findUnique({
      where: { id: group_id },
      select: {
        id: true,
        GroupMembers: {
          select: {
            id: true,
            user_id: true,
            User: {
              select: {
                id: true,
                full_name: true,
                email: true,
              },
            },
            GroupItems: {
              select: {
                quantity: true,
                Book: true,
              },
            },
          },
        },
      },
    });
  }

  async createNewGroup(user_id: string) {
    await this.prisma.users.findFirstOrThrow({
      where: { id: user_id },
    });
    const result = await this.prisma.groups.create({
      data: {
        host_id: user_id,
      },
    });
    await this.prisma.groupMembers.create({
      data: {
        user_id: user_id,
        group_id: result.id,
      },
    });
    return `${this.configService.get<string>('url_web')}/join-group-buy?group_id=${result.id}`;
  }

  async addBookToGroupBasket(
    user_id: string,
    group_id: string,
    dto: AddBookToGroupBasketDto,
  ) {
    const { book, groupMember } =
      await this.checkValidGroupMemberAndBookRequest(
        user_id,
        group_id,
        dto.book_id,
      );
    const existingGroupItem = await this.prisma.groupItems.findUnique({
      where: {
        group_member_id_book_id: {
          group_member_id: groupMember.id,
          book_id: dto.book_id,
        },
      },
    });
    if (existingGroupItem) {
      await this.prisma.groupItems.update({
        where: { id: existingGroupItem.id },
        data: {
          quantity:
            existingGroupItem.quantity + dto.quantity < book.stock_quantity
              ? existingGroupItem.quantity + dto.quantity
              : book.stock_quantity,
        },
      });
    } else {
      await this.prisma.groupItems.create({
        data: {
          group_member_id: groupMember.id,
          quantity:
            dto.quantity < book.stock_quantity
              ? dto.quantity
              : book.stock_quantity,
          book_id: dto.book_id,
        },
      });
    }
    return true;
  }
  async joinGroup(user_id: string, group_id: string) {
    const group = await this.prisma.groups.findUnique({
      where: {
        id: group_id,
      },
    });
    if (group.group_status != GroupStatus.ACTIVE) {
      throw new BadRequestException('You are not allowed to join this group');
    }
    const existingGroupMember = await this.prisma.groupMembers.findFirst({
      where: {
        user_id: user_id,
        group_id: group_id,
      },
    });
    if (existingGroupMember) {
      throw new BadRequestException('You have been already in this group');
    }
    await this.prisma.groupMembers.create({
      data: {
        user_id: user_id,
        group_id: group_id,
      },
    });
    return true;
  }

  async updateBookInGroupBasket(
    user_id: string,
    group_id: string,
    dto: UpdateGroupItemBookDto,
  ) {
    const { groupMember } = await this.checkValidGroupMemberAndBookRequest(
      user_id,
      group_id,
      dto.book_id,
    );
    const groupItem = await this.prisma.groupItems.findUnique({
      where: {
        group_member_id_book_id: {
          group_member_id: groupMember.id,
          book_id: dto.book_id,
        },
      },
    });
    if (!groupItem) {
      throw new BadRequestException('Book has been deleted from cart');
    }
    await this.prisma.groupItems.update({
      where: { id: groupItem.id },
      data: {
        quantity: dto.quantity,
      },
    });
    return true;
  }

  async updateGroupStatus(
    user_id: string,
    group_id: string,
    dto: UpdateGroupStatusDto,
  ) {
    const { group } = await this.checkValidGroupMemberAndHostAuthorize(
      user_id,
      group_id,
    );
    if (
      dto.group_status === GroupStatus.ACTIVE &&
      group.group_status !== GroupStatus.CHECK_OUT
    ) {
      throw new BadRequestException(
        'Group can only be re-activated from CHECK_OUT status',
      );
    }
    if (
      dto.group_status === GroupStatus.CHECK_OUT &&
      group.group_status !== GroupStatus.ACTIVE
    ) {
      throw new BadRequestException(
        'Group can only be checked out from ACTIVE status',
      );
    }
    await this.prisma.groups.update({
      where: { id: group.id },
      data: {
        group_status: dto.group_status,
      },
    });
    return true;
  }

  async createGroupOrder(
    user_id: string,
    group_id: string,
    dto: CreateGroupOrderDto,
  ) {}

  async testGoShipIntegration() {
    return this.goshipProvider.getCities();
  }

  private async checkValidGroupMemberAndBookRequest(
    user_id: string,
    group_id: string,
    book_id: string,
  ) {
    await this.prisma.users.findFirstOrThrow({
      where: {
        id: user_id,
      },
    });
    const group = await this.prisma.groups.findFirst({
      where: {
        id: group_id,
        group_status: GroupStatus.ACTIVE,
      },
    });
    if (!group) {
      throw new BadRequestException('Group must be in active status');
    }
    const book = await this.prisma.books.findFirstOrThrow({
      where: {
        id: book_id,
      },
    });
    if (!book) {
      throw new BadRequestException('Book not found');
    }
    const groupMember = await this.prisma.groupMembers.findFirst({
      where: {
        group_id: group_id,
        user_id: user_id,
      },
    });
    if (!groupMember) {
      throw new BadRequestException('You have not joined this group');
    }
    return { book, groupMember };
  }

  private async checkValidGroupMemberAndHostAuthorize(
    user_id: string,
    group_id: string,
  ) {
    await this.prisma.users.findFirstOrThrow({
      where: {
        id: user_id,
      },
    });
    const group = await this.prisma.groups.findUnique({
      where: {
        id: group_id,
      },
    });
    if (!group) {
      throw new BadRequestException('Group not found');
    }
    const groupMember = await this.prisma.groupMembers.findFirst({
      where: {
        group_id: group_id,
        user_id: user_id,
      },
    });
    if (!groupMember) {
      throw new BadRequestException('You have not joined this group');
    }
    if (group.host_id != user_id) {
      throw new BadRequestException('You are not the host of this group');
    }
    return { group };
  }
}
