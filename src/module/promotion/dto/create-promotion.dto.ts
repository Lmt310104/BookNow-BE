import { ApiProperty } from '@nestjs/swagger';
import { DiscountType, PromotionCategory } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreatePromotionDto {
  @ApiProperty({
    description: 'Name of the promotion',
    example: 'Promotion 1',
  })
  @IsNotEmpty()
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
  order_limit?: number;
  @ApiProperty({
    description: 'Discount value',
    example: 10000,
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
  @IsNotEmpty()
  @IsEnum(PromotionCategory)
  type: PromotionCategory;

  @ApiProperty({
    description: 'Description of the promotion',
    example: 'FIXED',
  })
  @IsNotEmpty()
  @IsEnum(DiscountType)
  discount_type: DiscountType;

  @ApiProperty({
    description: 'Product ids',
    example: ['0e723bd6-8c68-4477-be17-5233c8e7b63a'],
  })
  @IsArray()
  @IsNotEmpty()
  book_ids: string[];
}

export class CreatePromotionNormalDetailDto {
  @ApiProperty({
    description: 'Discount amount of the promotion',
    example: '30000',
  })
  @IsOptional()
  discount_amount: Decimal;

  @ApiProperty({
    description: 'Discount percentage of the promotion',
    example: '10',
  })
  discount_rate: Decimal;

  @ApiProperty({
    description: 'Min quantity must be bought to adapt',
    example: '10',
  })
  min_quantity: Decimal;
}

export class CreateNormalPromotionDto {
  @ApiProperty({
    description: 'promotion campaign name',
    example: 'Đại lễ siêu sale 30/4 1/5',
  })
  @IsNotEmpty()
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
    description: 'Description of the promotion',
    example: 'Description example',
  })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty()
  @Type(() => CreateNormalPromotionDto)
  @IsNotEmpty()
  promotion_eligibility: CreatePromotionNormalDetailDto;
}

export class CreatePromotionComboDto {
  @ApiProperty({
    description: 'Max usage per user',
  })
  @IsNotEmpty()
  nax_usage_per_user: Decimal;

  @ApiProperty({
    description: 'Promotion eligibilities',
  })
  @IsArray()
  @Type(() => CreatePromotionComboEligibility)
  eligibilities: CreatePromotionComboEligibility[];
}

export class CreatePromotionComboEligibility {
  @ApiProperty({
    description: 'Discount rate',
  })
  @IsNotEmpty()
  discount_rate: Decimal;

  @ApiProperty({
    description: 'Discount amout',
  })
  @IsNotEmpty()
  discount_amount: Decimal;

  @ApiProperty({
    description: 'Min quantity must be bought to adapt',
  })
  @IsNotEmpty()
  quatity: Decimal;
}

export class CreatePromotionShockDealDto {
  @ApiProperty({
    description: 'Max deal can make by a user',
    example: '10',
  })
  @IsNotEmpty()
  max_deal_can_make: Decimal;

  @ApiProperty({
    description: 'Promotion eligibilities',
  })
  @IsArray()
  @Type(() => CreatePromotionShockDealEligibility)
  eligibilities: CreatePromotionShockDealEligibility[];
}

class CreatePromotionShockDealEligibility {
  @ApiProperty({
    description: 'Discount rate',
    example: '10',
  })
  @IsNotEmpty()
  discount_rate: Decimal;

  @ApiProperty({
    description: 'Discount amount',
  })
  @IsNotEmpty()
  discount_amount: Decimal;

  @ApiProperty()
  @IsNotEmpty()
  product_id: string;
}
