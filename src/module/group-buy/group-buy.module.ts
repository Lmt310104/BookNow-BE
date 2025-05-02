import { PrismaModule } from '@module/prisma/prisma.module';
import { Module } from '@nestjs/common';
import { GroupBuyController } from './group-buy.controller';
import { GroupBuyService } from './group-buy.service';
import { GoshipSDKProvider } from 'src/common/providers/goship.provider';

@Module({
  imports: [PrismaModule],
  controllers: [GroupBuyController],
  providers: [GroupBuyService, GoshipSDKProvider],
})
export class GroupBuyModule {}
