import { PrismaModule } from '@module/prisma/prisma.module';
import { Module } from '@nestjs/common';
import { GroupBuyController } from './group-buy.controller';
import { GroupBuyService } from './group-buy.service';

@Module({
  imports: [PrismaModule],
  controllers: [GroupBuyController],
  providers: [GroupBuyService],
})
export class GroupBuyModule {}
