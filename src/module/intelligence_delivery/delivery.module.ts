import { Module } from '@nestjs/common';
import { DeliveryController } from './delivery.controller';
import { PrismaModule } from '@module/prisma/prisma.module';
import { OptimoRouteSDKProvider } from 'src/common/providers/optimo-route.provider';
import { DeliveryService } from './delivery.service';

@Module({
  imports: [PrismaModule],
  controllers: [DeliveryController],
  providers: [OptimoRouteSDKProvider, DeliveryService],
  exports: [OptimoRouteSDKProvider],
})
export class DeliveryModule {}
