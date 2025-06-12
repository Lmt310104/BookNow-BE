import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsDecimal,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class CreatePromotionGroupBuyDto {
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Start date of the promotion',
    example: '2025-03-03 00:00:00',
  })
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  start_date: Date;

  @ApiProperty({
    description: 'End date of the promotion',
    example: '2025-04-03 00:00:00',
  })
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  end_date: Date;
  @ApiProperty({
    description: 'Order limit number',
    example: 10,
  })
  @IsOptional()
  @IsInt()
  order_limit?: number;

  @IsOptional()
  @IsInt()
  max_usage_per_user?: number;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean = true;

  @IsOptional()
  @ValidateNested()
  @Type(() => GroupBuyDiscountableDto)
  group_buy?: GroupBuyDiscountableDto;
}

export class GroupBuyDiscountableDto {
  @IsInt()
  required_user_quantity: number;

  @IsDecimal()
  discount_amount: number;

  @IsDecimal()
  discount_rate: number;
}
