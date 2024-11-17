import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ORDER_STATUS_ENUM } from 'src/utils/constants';

export class StatisticQuery {
  @IsString()
  @IsNotEmpty()
  fromDate: string = new Date(Date.now()).toISOString().split('T')[0];

  @IsString()
  @IsNotEmpty()
  toDate: string = new Date(Date.now() + 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];

  @IsEnum(ORDER_STATUS_ENUM)
  @IsOptional()
  status: ORDER_STATUS_ENUM = ORDER_STATUS_ENUM.SUCCESS;
}
