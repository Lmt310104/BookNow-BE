// Add these methods to your existing GroupBuyService
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@module/prisma/prisma.service';

@Injectable()
export class GroupBuyGateWayService {
  constructor(private readonly prisma: PrismaService) {}

  // Get all groups a user is a member of
  async getUserGroups(userId: string) {
    return this.prisma.groupMembers
      .findMany({
        where: { user_id: userId },
        select: {
          Group: true,
        },
      })
      .then((results) => results.map((r) => r.Group));
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

  // Get user details for chat display
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
  async getGroupBasket(group_id: string) {
    return await this.prisma.groups.findUnique({
      where: { id: group_id },
      select: {
        id: true,
        group_status: true,
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
                Book: true,
              },
            },
          },
        },
      },
    });
  }
}
