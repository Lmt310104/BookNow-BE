import { ApiProperty } from '@nestjs/swagger';
import { DiscountType, PromotionCategory } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsArray, IsDate, IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdatePromotionDto {
  @ApiProperty({
    description: 'Name of the promotion',
    example: 'Promotion 1',
  })
  @IsOptional()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Start date of the promotion',
    example: '2025-03-03 00:00:00',
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  start_date: Date;

  @ApiProperty({
    description: 'End date of the promotion',
    example: '2025-04-03 00:00:00',
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  end_date: Date;
  @ApiProperty({
    description: 'Order limit number',
    example: 10,
  })
  @IsOptional()
  order_limit?: number;
  @ApiProperty({
    description: 'Discount value',
    example: 10,
  })
  @IsOptional()
  discount_value: number;

  @ApiProperty({
    description: 'Max user per unit',
    example: 10,
  })
  @IsOptional()
  max_usage_per_user?: number;

  @ApiProperty({
    description: 'Discount type',
    example: 'SHOP_DISCOUNT',
  })
  @IsOptional()
  @IsEnum(PromotionCategory)
  type: PromotionCategory;

  @ApiProperty({
    description: 'Description of the promotion',
    example: 'FIXED',
  })
  @IsOptional()
  @IsEnum(DiscountType)
  discount_type: DiscountType;

  @ApiProperty({
    description: 'Product ids',
    example: ['0e723bd6-8c68-4477-be17-5233c8e7b63a'],
  })
  @IsArray()
  @IsOptional()
  book_ids: string[];
}
