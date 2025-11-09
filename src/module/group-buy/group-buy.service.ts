import { PrismaService } from '@module/prisma/prisma.service';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AddBookToGroupBasketDto } from './dto/add-book-to-group-basket.dto';
import {
  GroupStatus,
  PromotionComboType,
  PromotionStatus,
} from '@prisma/client';
import { UpdateGroupItemBookDto } from './dto/update-group-item-book.dto';
import { UpdateGroupStatusDto } from './dto/update-group-status.dto';
import { CheckoutGroupOrderDto } from './dto/checkout-group-order.dto';
import { GroupBuyGateway } from './group-buy.gateway';
import { generateReadableGroupName } from 'src/utils/group-name-generator';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class GroupBuyService {
  constructor(
    private readonly prisma: PrismaService,
    private configService: ConfigService,
    private readonly groupBuyGateway: GroupBuyGateway,
  ) {}
  async getGroupBasket(group_id: string) {
    const groupData = await this.prisma.groups.findUnique({
      where: { id: group_id },
      select: {
        id: true,
        GroupMembers: {
          select: {
            id: true,
            user_id: true,
            is_confirmed: true,
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
                Book: {
                  include: {
                    PromotionNormalDetail: {
                      include: {
                        Promotion: true,
                      },
                    },
                    PromotionComboProduct: {
                      include: {
                        PromotionCombo: {
                          include: {
                            Promotion: true,
                            PromotionComboCondition: true,
                          },
                        },
                      },
                    },
                    PromotionShockDealBook: {
                      include: {
                        PromotionShockDeal: {
                          include: {
                            Promotion: true,
                            PromotionShockDealCondition: true,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (groupData && groupData.GroupMembers) {
      groupData.GroupMembers.forEach((member) => {
        if (member.GroupItems) {
          member.GroupItems.forEach((item) => {
            if (item.Book) {
              if (item.Book.PromotionNormalDetail) {
                item.Book.PromotionNormalDetail =
                  item.Book.PromotionNormalDetail.filter(
                    (pnd) => pnd.Promotion.is_active,
                  );
              }

              if (item.Book.PromotionComboProduct) {
                item.Book.PromotionComboProduct =
                  item.Book.PromotionComboProduct.filter(
                    (pcp) => pcp.PromotionCombo?.Promotion?.is_active,
                  );
              }

              if (item.Book.PromotionShockDealBook) {
                item.Book.PromotionShockDealBook =
                  item.Book.PromotionShockDealBook.filter(
                    (psd) =>
                      psd.PromotionShockDeal &&
                      psd.PromotionShockDeal.Promotion.is_active,
                  );
              }
            }
          });
        }
      });
    }

    return groupData;
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
    return {
      group_id: result.id,
      group_url: `${this.configService.get<string>('url_web')}/join-group-buy?group_id=${result.id}`,
    };
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
    await this.prisma.groupMembers.update({
      where: {
        id: groupMember.id,
      },
      data: {
        is_confirmed: !groupMember.is_confirmed,
      },
    });
    return !groupMember.is_confirmed;
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
    const isAllConfirmed = groupMembers
      .filter((member) => member.user_id !== user_id)
      .every((member) => member.is_confirmed);
    if (!isAllConfirmed) {
      throw new BadRequestException(
        'All group members must confirm the order before checkout',
      );
    }
    const groupMemberIds = groupMembers.map((member) => member.id);
    const allGroupItemsRelated = await this.prisma.groupItems.findMany({
      where: {
        group_member_id: { in: groupMemberIds },
      },
    });
    const allGroupItemsRelatedIds = allGroupItemsRelated.map((item) => item.id);
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
    const bookIds = Array.from(bookGroups.keys());
    const books = await this.prisma.books.findMany({
      where: {
        id: { in: bookIds },
      },
    });
    if (books.length !== bookIds.length) {
      throw new NotFoundException('Some books in the order do not exist');
    }
    const discountMap = new Map<string, number>();
    const promotions_shock_deal_map = new Map<
      string,
      {
        book_primary: string[];
        discount_rate?: number;
        discount_amount?: Decimal;
      }
    >();
    for (const [bookId, bookData] of bookGroups.entries()) {
      const promotionIdsArray = Array.from(bookData.promotion_ids);
      const { total_discount_combo, promotion_shock_deal_map } =
        await this.getBooksPrbookomotionConditionForGroup(
          bookId,
          promotionIdsArray,
          bookData.quantity,
        );

      discountMap.set(bookId, total_discount_combo);
      promotions_shock_deal_map.set(bookId, promotion_shock_deal_map);
    }
    const bookPriceMap = new Map(
      books.map((book) => [
        book.id,
        {
          price: book.price,
          finalPrice: book.final_price ?? book.price,
          current_price: book.current_price,
        },
      ]),
    );
    return await this.prisma.$transaction(
      async (tx) => {
        await tx.groupItems.deleteMany({
          where: {
            id: { in: allGroupItemsRelatedIds },
          },
        });
        const order = await tx.orders.create({
          data: {
            user: { connect: { id: group.host_id } },
            full_name: dto.fullName,
            phone_number: dto.phoneNumber,
            payment_method: dto.paymentMethod,
            address: dto.address,
            latitude: dto.latitude,
            longitude: dto.longitude,
            pending_at: new Date(),
          },
        });
        const orderItems = [];
        for (const memberItem of dto.items) {
          const memberId = memberItem.member_id;
          for (const item of memberItem.items) {
            const bookId = item.bookId;
            const quantity = item.quantity;
            const {
              price,
              finalPrice,
              current_price: originalCurrentPrice,
            } = bookPriceMap.get(bookId);
            let current_price = originalCurrentPrice;
            const promotion_shock_deal_map =
              promotions_shock_deal_map.get(bookId);
            const has_primary_book =
              promotion_shock_deal_map?.book_primary?.length > 0 &&
              dto.items.some((memberItem) =>
                memberItem.items.some((bookItem) =>
                  promotion_shock_deal_map.book_primary.includes(
                    bookItem.bookId,
                  ),
                ),
              );
            if (has_primary_book && promotion_shock_deal_map) {
              if (promotion_shock_deal_map.discount_amount) {
                current_price = new Decimal(
                  Number(current_price) -
                    Number(promotion_shock_deal_map.discount_amount),
                );
              } else if (promotion_shock_deal_map.discount_rate) {
                current_price = new Decimal(
                  Number(current_price) *
                    (1 - Number(promotion_shock_deal_map.discount_rate) / 100),
                );
              }
            }
            const bookDiscount = discountMap.get(bookId) || 0;

            const basePrice = current_price
              ? Number(current_price)
              : Number(finalPrice || price);
            const itemSubtotal = basePrice * quantity;
            const totalPrice = Math.max(0, itemSubtotal - bookDiscount);

            orderItems.push({
              order_id: order.id,
              book_id: bookId,
              quantity: quantity,
              price: price,
              group_user_id: memberId,
              total_price: totalPrice,
            });

            console.log(
              `Processed order item for book: ${bookId}, quantity: ${quantity}, price: ${basePrice}, discount: ${bookDiscount}, final price: ${totalPrice}`,
            );
          }
        }
        await tx.orderItems.createMany({ data: orderItems });
        await Promise.all(
          orderItems.map((item) =>
            tx.books.update({
              where: { id: item.book_id },
              data: {
                stock_quantity: { decrement: item.quantity },
                sold_quantity: { increment: item.quantity },
              },
            }),
          ),
        );
        const totalPrice = orderItems.reduce(
          (acc, item) => acc + item.total_price,
          0,
        );
        await tx.groups.update({
          where: { id: group.id },
          data: {
            group_status: GroupStatus.DELETED,
          },
        });
        const updatedOrder = await tx.orders.update({
          where: { id: order.id },
          data: {
            total_price: totalPrice,
          },
          include: {
            OrderItems: {
              include: {
                book: true,
              },
            },
          },
        });
        return updatedOrder;
      },
      {
        timeout: 20000,
      },
    );
  }
  private async getBooksPrbookomotionConditionForGroup(
    book_id: string,
    promotion_ids: any[],
    quantity: number,
  ): Promise<{
    book: any;
    total_discount_combo: number;
    promotion_shock_deal_map: {
      book_primary: string[];
      discount_rate?: number;
      discount_amount?: Decimal;
    };
  }> {
    const promotion_shock_deal_map: any = {
      book_primary: [],
      discount_rate: undefined,
      discount_amount: undefined,
    };
    let total_discount_combo = 0;
    const book = await this.prisma.books.findUnique({
      where: { id: book_id },
    });

    const promotions = await this.prisma.promotion.findMany({
      where: {
        id: { in: promotion_ids },
        status: PromotionStatus.ONGOING,
      },
      include: {
        PromotionNormalDetail: true,
        PromotionCombo: {
          include: {
            PromotionComboCondition: true,
            PromotionComboProduct: true,
          },
        },
        PromotionShockDeal: {
          include: {
            PromotionShockDealBook: true,
            PromotionShockDealCondition: true,
          },
        },
      },
    });

    if (promotions.length !== promotion_ids.length) {
      throw new BadRequestException(
        `Some promotions are not valid for product: ${book.title}`,
      );
    }
    for (const promotion of promotions) {
      if (promotion.PromotionNormalDetail.length !== 0) {
        const isApplicableToBook = promotion.PromotionNormalDetail.some(
          (condition) => condition.book_id === book_id,
        );

        if (!isApplicableToBook) {
          throw new BadRequestException(
            `Promotion "${promotion.name}" is not applicable to book: ${book.title}`,
          );
        }
      }
      if (promotion.PromotionCombo) {
        const isApplicableToBook =
          promotion.PromotionCombo.PromotionComboProduct.some(
            (condition) => condition.book_id === book_id,
          );

        if (!isApplicableToBook) {
          throw new BadRequestException(
            `Promotion "${promotion.name}" is not applicable to book: ${book.title}`,
          );
        }
        const comboConditions =
          promotion.PromotionCombo.PromotionComboCondition;

        const sortedConditions = comboConditions
          .filter((c) => c.quantity && c.quantity <= quantity)
          .sort((a, b) => b.quantity - a.quantity);

        if (sortedConditions.length > 0) {
          const condition = sortedConditions[0];

          if (
            condition.discount_value &&
            promotion.PromotionCombo.promotion_combo_type ===
              PromotionComboType.FIXED_AMOUNT
          ) {
            total_discount_combo = condition.discount_value.toNumber();
          } else if (
            condition.discount_value &&
            promotion.PromotionCombo.promotion_combo_type ===
              PromotionComboType.PERCENTAGE
          ) {
            total_discount_combo =
              (Number(book.current_price) ?? Number(book.final_price)) *
              quantity *
              (Number(condition.discount_value) / 100);
          }
        }
      }
      if (promotion.PromotionShockDeal) {
        const isApplicableToBook =
          promotion.PromotionShockDeal.PromotionShockDealBook.some(
            (condition) => condition.book_id === book_id,
          );

        if (!isApplicableToBook) {
          throw new BadRequestException(
            `Promotion "${promotion.name}" is not applicable to book: ${book.title}`,
          );
        }
        promotion_shock_deal_map.book_primary.push(
          ...promotion.PromotionShockDeal.PromotionShockDealBook.map(
            (book) => book.book_id,
          ),
        );
        for (const condition of promotion.PromotionShockDeal
          .PromotionShockDealCondition) {
          if (condition.book_id === book_id) {
            promotion_shock_deal_map.discount_amount =
              condition.discount_amount;
            promotion_shock_deal_map.discount_rate = condition.discount_rate;
          }
        }
      }
    }
    return { book, total_discount_combo, promotion_shock_deal_map };
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
    const groupItem = await this.prisma.groupItems.findFirst({
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
        return groupBelongToUser
          .filter((group) => group.Group.group_status !== GroupStatus.DELETED)
          .map((membership) => {
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

  async getGroup(user_id: string, group_id: string) {
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
    return {
      group_id: group.id,
      name: group.name,
      host_id: group.host_id,
      group_status: group.group_status,
      is_confirmed: groupMember.is_confirmed || false,
    };
  }
}
