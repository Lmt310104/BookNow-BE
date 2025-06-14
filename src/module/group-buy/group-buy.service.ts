import { PrismaService } from '@module/prisma/prisma.service';
import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AddBookToGroupBasketDto } from './dto/add-book-to-group-basket.dto';
import { GroupStatus } from '@prisma/client';
import { UpdateGroupItemBookDto } from './dto/update-group-item-book.dto';
import { UpdateGroupStatusDto } from './dto/update-group-status.dto';
import { CheckoutGroupOrderDto } from './dto/checkout-group-order.dto';
import { GroupBuyGateway } from './group-buy.gateway';
import { generateReadableGroupName } from 'src/utils/group-name-generator';

@Injectable()
export class GroupBuyService {
  constructor(
    private readonly prisma: PrismaService,
    private configService: ConfigService,
    private readonly groupBuyGateway: GroupBuyGateway,
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
        name: generateReadableGroupName(),
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
    this.groupBuyGateway.notifyGroupUpdate(group_id, 'BOOK_ADDED', {
      user_id,
      book_id: dto.book_id,
      book_name: book.title,
      book_image: book.image_url,
      quantity: dto.quantity,
    });

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
    this.groupBuyGateway.notifyGroupUpdate(group_id, 'MEMBER_ADDED', {
      user_id,
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
    this.groupBuyGateway.notifyGroupUpdate(group_id, 'STATUS_UPDATED', {
      status: dto.group_status,
      updatedBy: user_id,
    });

    return true;
  }

  async confirmOrder(user_id: string, group_id: string) {
    const { groupMember } = await this.checkValidGroupMember(user_id, group_id);
    if (groupMember.is_confirmed) {
      throw new BadRequestException('You have already confirmed the order ');
    }
    await this.prisma.groupMembers.update({
      where: {
        id: groupMember.id,
      },
      data: {
        is_confirmed: true,
      },
    });
    return true;
  }

  async checkOutGroupOrder(
    user_id: string,
    group_id: string,
    dto: CheckoutGroupOrderDto,
  ) {
    const { group } = await this.checkValidGroupMemberAndHostAuthorize(
      user_id,
      group_id,
    );
    const groupMembers = await this.prisma.groupMembers.findMany({
      where: {
        group_id: group.id,
      },
    });
    const isAllConfirmed = groupMembers.every((member) => member.is_confirmed);
    if (!isAllConfirmed) {
      throw new BadRequestException(
        'All group members must confirm the order before checkout',
      );
    }
  }

  async kickOutGroupMember(
    user_id: string,
    group_id: string,
    member_id: string,
  ) {
    const { group } = await this.checkValidGroupMemberAndHostAuthorize(
      user_id,
      group_id,
    );
    const groupMember = await this.prisma.groupMembers.findFirst({
      where: {
        id: member_id,
        group_id: group.id,
      },
    });
    if (!groupMember) {
      throw new BadRequestException('Group member not found');
    }
    await this.prisma.groupMembers.delete({
      where: {
        id: groupMember.id,
      },
    });
    await this.prisma.groupItems.deleteMany({
      where: {
        group_member_id: groupMember.id,
      },
    });
    this.groupBuyGateway.notifyGroupUpdate(group_id, 'MEMBER_KICKED', {
      removedMemberId: member_id,
      removedBy: user_id,
    });
    return true;
  }

  async deleteBookFromGroupBasket(
    user_id: string,
    group_id: string,
    item_id: string,
  ) {
    const { groupMember } = await this.checkValidGroupMemberAndBookRequest(
      user_id,
      group_id,
      item_id,
    );
    const groupItem = await this.prisma.groupItems.findUnique({
      where: {
        id: item_id,
        group_member_id: groupMember.id,
      },
    });
    if (!groupItem) {
      throw new BadRequestException('Book has been deleted from cart');
    }
    await this.prisma.groupItems.delete({
      where: { id: groupItem.id },
    });
    this.groupBuyGateway.notifyGroupUpdate(group_id, 'BOOK_DELETED', {
      user_id,
      book_id: groupItem.book_id,
    });
    return true;
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

  private async checkValidGroupMember(user_id: string, group_id: string) {
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
    const groupMember = await this.prisma.groupMembers.findFirst({
      where: {
        group_id: group_id,
        user_id: user_id,
      },
    });
    if (!groupMember) {
      throw new BadRequestException('You have not joined this group');
    }
    return { group, groupMember };
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
      include: {
        GroupMembers: true,
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

  async getUserGroups(userId: string) {
    {
      try {
        const groupBelongToUser = await this.prisma.groupMembers.findMany({
          where: {
            user_id: userId,
          },
          include: {
            Group: {
              select: {
                id: true,
                name: true,
                host_id: true,
                created_at: true,
                group_status: true,
                GroupMembers: {
                  where: {
                    user_id: userId,
                  },
                  select: {
                    is_confirmed: true,
                  },
                },
              },
            },
          },
        });
        if (groupBelongToUser.length === 0) {
          return [];
        }
        return groupBelongToUser.map((membership) => {
          return {
            group_id: membership.Group.id,
            name: membership.Group.name,
            host_id: membership.Group.host_id,
            group_status: membership.Group.group_status,
            is_confirmed:
              membership.Group.GroupMembers[0]?.is_confirmed || false,
          };
        });
      } catch (error) {
        console.error('Error fetching user groups with status:', error);
        throw new InternalServerErrorException(
          'Failed to retrieve user groups information',
        );
      }
    }
  }

  async groupBuyCheckOut(user_id: string, dto: CheckoutGroupOrderDto) {
    try {
      const user = await this.prisma.users.findUnique({
        where: { id: user_id },
      });
      if (!user) {
        throw new NotFoundException('User not found');
      }
      const group = await this.prisma.groups.findUnique({
        where: { id: dto.group_id },
      });
      if (user_id != group.host_id) {
        throw new BadRequestException('Only host can checkout group order');
      }
      if (group.group_status !== GroupStatus.CHECK_OUT) {
        throw new BadRequestException(
          'Group must be in CHECK_OUT status to proceed with checkout',
        );
      }
      const bookGroups = new Map();
      dto.items.forEach((memberItem) => {
        memberItem.items.forEach((item) => {
          const bookId = item.bookId;
          const quantity = item.quantity;

          if (!bookGroups.has(bookId)) {
            bookGroups.set(bookId, {
              quantity: 0,
              promotion_ids: new Set(),
            });
          }

          const bookGroup = bookGroups.get(bookId);
          bookGroup.quantity += quantity;

          if (item.promotion_ids && item.promotion_ids.length > 0) {
            item.promotion_ids.forEach((id) => bookGroup.promotion_ids.add(id));
          }
        });
      });
    } catch (error) {
      console.log('Error:', error);
      throw new HttpException(error.message, 500);
    }
  }

  async isUserGroupMember(userId: string, groupId: string): Promise<boolean> {
    const member = await this.prisma.groupMembers.findFirst({
      where: {
        user_id: userId,
        group_id: groupId,
      },
    });

    return !!member;
  }
  async getUserDetails(userId: string) {
    return this.prisma.users.findUnique({
      where: { id: userId },
      select: {
        id: true,
        full_name: true,
        avatar_url: true,
      },
    });
  }

  async getGroupStatus(user_id: string, group_id: string) {
    const { group } = await this.checkValidGroupMember(user_id, group_id);
    if (!group) {
      throw new BadRequestException('Group not found');
    }
    return group.group_status;
  }
}
