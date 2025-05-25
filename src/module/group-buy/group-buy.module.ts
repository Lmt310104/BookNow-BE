import { PrismaModule } from '@module/prisma/prisma.module';
import { Module } from '@nestjs/common';
import { GroupBuyController } from './group-buy.controller';
import { GroupBuyService } from './group-buy.service';
import { GroupBuyGateway } from './group-buy.gateway';
import { GroupBuyGateWayService } from './group-buy.gateway.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [PrismaModule, JwtModule.register({ global: true })],
  controllers: [GroupBuyController],
  providers: [GroupBuyService, GroupBuyGateWayService, GroupBuyGateway],
  exports: [GroupBuyService],
})
export class GroupBuyModule {}
