import { Module } from '@nestjs/common';
import { EventsGateway } from './event_gateway.gateway';

@Module({
  providers: [EventsGateway],
})
export class EventsModule {}
