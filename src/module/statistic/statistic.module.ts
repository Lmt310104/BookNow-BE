import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { StatisticController } from './statistic.controller';
import { StatisticService } from './statistic.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [PrismaModule],
  controllers: [StatisticController],
  providers: [StatisticService, PrismaService],
})
export class StatisticModule {}
