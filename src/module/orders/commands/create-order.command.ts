import { TUserSession } from 'src/common/decorators/user-session.decorator';
import { CreateOrderDto } from '../dto/create-order.dto';

export class CreateOrderCommand {
  constructor(
    public readonly user: TUserSession,
    public readonly dto: CreateOrderDto,
  ) {}
}
