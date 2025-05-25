import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { WsJwtGuard } from '../../common/guards/ws-jwt.guard';
import { GroupBuyGateWayService } from './group-buy.gateway.service';

import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'group-buy',
})
export class GroupBuyGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(GroupBuyGateway.name);
  private userSocketMap = new Map<string, Socket>();
  private groupUserMap = new Map<string, Set<string>>();

  @WebSocketServer() server: Server;

  constructor(
    private readonly groupBuyGateWayService: GroupBuyGateWayService,
    private readonly config: ConfigService,
  ) {}

  afterInit(server: Server) {
    this.logger.log('Group Buy WebSocket Gateway initialized');
  }

  async handleConnection(client: Socket) {
    try {
      // Extract and verify token from handshake
      const token =
        client.handshake.auth.token || client.handshake.headers.authorization;
      if (!token) {
        client.disconnect();
        return;
      }
      // Verify the token and get user info
      const userId = await this.verifyToken(token);
      if (!userId) {
        client.disconnect();
        return;
      }

      // Store socket connection in map
      this.userSocketMap.set(userId, client);

      // Find groups the user is part of and join those rooms
      const userGroups =
        await this.groupBuyGateWayService.getUserGroups(userId);
      userGroups.forEach((group) => {
        client.join(`group:${group.id}`);

        // Update the group user map
        if (!this.groupUserMap.has(group.id)) {
          this.groupUserMap.set(group.id, new Set());
        }
        this.groupUserMap.get(group.id).add(userId);
      });

      this.logger.log(`Client connected: ${userId}`);
      this.logger.log(`User groups: ${JSON.stringify(userGroups)}`);
    } catch (error) {
      this.logger.error(`Connection error: ${error.message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    // Find user ID from socket
    let disconnectedUserId: string | null = null;

    for (const [userId, socket] of this.userSocketMap.entries()) {
      if (socket.id === client.id) {
        disconnectedUserId = userId;
        this.userSocketMap.delete(userId);
        break;
      }
    }

    if (disconnectedUserId) {
      // Remove user from all group maps
      for (const [groupId, users] of this.groupUserMap.entries()) {
        if (users.has(disconnectedUserId)) {
          users.delete(disconnectedUserId);

          // If group is empty, remove it from the map
          if (users.size === 0) {
            this.groupUserMap.delete(groupId);
          }
        }
      }

      this.logger.log(`Client disconnected: ${disconnectedUserId}`);
    }
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('joinGroup')
  async handleJoinGroup(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { groupId: string },
  ) {
    const userId = client.data.user.id;
    const { groupId } = data;

    try {
      const isMember = await this.groupBuyGateWayService.isUserGroupMember(
        userId,
        groupId,
      );
      if (!isMember) {
        return { error: 'You are not a member of this group' };
      }

      // Join the room
      client.join(`group:${groupId}`);

      // Update group user map
      if (!this.groupUserMap.has(groupId)) {
        this.groupUserMap.set(groupId, new Set());
      }
      this.groupUserMap.get(groupId).add(userId);

      // Get current group data
      const groupData =
        await this.groupBuyGateWayService.getGroupBasket(groupId);


      return { success: true, group: groupData };
    } catch (error) {
      this.logger.error(`Error joining group: ${error.message}`);

      return { error: 'Failed to join group' };
    }
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('leaveGroup')
  handleLeaveGroup(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { groupId: string },
  ) {
    const userId = client.data.user.id;
    const { groupId } = data;

    try {
      client.leave(`group:${groupId}`);

      if (this.groupUserMap.has(groupId)) {
        this.groupUserMap.get(groupId).delete(userId);
        if (this.groupUserMap.get(groupId).size === 0) {
          this.groupUserMap.delete(groupId);
        }
      }

      return { success: true };
    } catch (error) {
      this.logger.error(`Error leaving group: ${error.message}`);
      return { error: 'Failed to leave group' };
    }
  }
  // Group chat message
  @UseGuards(WsJwtGuard)
  @SubscribeMessage('groupMessage')
  async handleGroupMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { groupId: string; message: string },
  ) {
    const userId = client.data.user.id;
    const { groupId, message } = data;

    try {
      // Verify the user is a member of this group
      const isMember = await this.groupBuyGateWayService.isUserGroupMember(
        userId,
        groupId,
      );
      if (!isMember) {
        client.emit('groupMessage', {
          error: 'You are not a member of this group',
        });

        return { error: 'You are not a member of this group' };
      }

      // Get user details
      const user = await this.groupBuyGateWayService.getUserDetails(userId);

      // Broadcast to all members of the group
      this.server.to(`group:${groupId}`).emit('groupMessage', {
        groupId,
        userId,
        userName: user.full_name,
        userAvatar: user.avatar_url,
        message,
        timestamp: new Date(),
      });
      return { success: true };
    } catch (error) {
      this.logger.error(`Error sending group message: ${error.message}`);
      return { error: 'Failed to send message' };
    }
  }

  // Public method to notify group members of changes
  notifyGroupUpdate(groupId: string, eventType: string, data: any) {
    this.server.to(`group:${groupId}`).emit('groupUpdate', {
      type: eventType,
      groupId,
      data,
      timestamp: new Date(),
    });
  }

  // Helper method to verify token
  private async verifyToken(token: string): Promise<string | null> {
    try {
      if (token.startsWith('Bearer ')) {
        token = token.substring(7);
      }
      const payload = jwt.verify(
        token,
        this.config.get<string>('jwt_access_secret'),
      ) as any;
      return payload.id;
    } catch (error) {
      this.logger.error(`Token verification failed: ${error.message}`);
      return null;
    }
  }
}
