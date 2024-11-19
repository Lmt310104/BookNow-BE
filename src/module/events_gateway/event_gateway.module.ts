import { Module } from '@nestjs/common';
import { EventsGateway } from './event_gateway.gateway';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [EventsGateway],
})
export class EventsModule {}
