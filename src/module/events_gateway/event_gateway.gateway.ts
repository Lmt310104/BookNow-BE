import {
    MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { from, map, Observable } from 'rxjs';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway {
  @WebSocketServer()
  server: Server;
  @SubscribeMessage('events')
  onEvent(@MessageBody() data: unknown): Observable<unknown> {
    const event = 'events';
    const response = [1, 2, 3];
    return from(response).pipe(map((data) => ({ event, data })));
  }
}
