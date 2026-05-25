import { ApiProperty } from '@nestjs/swagger';
import {
  DiscountType,
  PromotionCategory,
  PromotionComboType,
  PromotionShockDealType,
} from '@prisma/client';
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
    description: 'Book id',
    example: '4cf1da1a-1641-458e-8d37-7f80f96119ba',
  })
  @IsOptional()
  book_id: string;
  @ApiProperty({
    description: 'Discount amount of the promotion',
    example: '30000',
  })
  @IsOptional()
  discount_amount: number;

  @ApiProperty({
    description: 'Discount percentage of the promotion',
    example: '10',
  })
  discount_rate: number;
}

export class CreateNormalPromotionDto {
  @ApiProperty({
    description: 'promotion campaign name',
    example: 'Đại lễ siêu sale 30/4 1/5',
  })
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Order limit',
    example: 10,
  })
  @IsOptional()
  order_limit: number;
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
  promotion_eligibility: CreatePromotionNormalDetailDto[];
}

export class CreatePromotionComboDto {
  @ApiProperty({
    description: 'Name of the campaign',
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
  @ApiProperty({
    description: 'Promotion combo category',
  })
  @IsNotEmpty()
  @IsEnum(PromotionComboType)
  type: PromotionComboType;
  @ApiProperty({
    description: 'Max usage per user',
  })
  @IsNotEmpty()
  max_usage_per_user: number;

  @ApiProperty({
    description: 'Promotion eligibilities',
  })
  @IsArray()
  @Type(() => CreatePromotionComboCondition)
  eligibilities: CreatePromotionComboCondition[];
  @ApiProperty({
    description: 'Product ids',
    example: ['0e723bd6-8c68-4477-be17-5233c8e7b63a'],
  })
  @IsArray()
  @IsNotEmpty()
  book_ids: string[];
}

export class CreatePromotionComboCondition {
  @ApiProperty({
    description: 'Quantity',
  })
  @IsNotEmpty()
  quantity: number;

  @ApiProperty({
    description: 'Discount value',
  })
  @IsNotEmpty()
  discount_value: number;
}

export class CreatePromotionShockDealDto {
  @ApiProperty({
    description: 'Name of the campaign',
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
  @ApiProperty({
    description: 'Promotion combo category',
  })
  @IsNotEmpty()
  @IsEnum(PromotionShockDealType)
  type: PromotionShockDealType;

  @ApiProperty({
    description: 'The required quantity of items for a purchase',
    example: 5,
  })
  @IsOptional()
  required_purchase_quantity: number;

  @ApiProperty({
    description: 'The quantity of gift items received with the purchase',
    example: 1,
  })
  @IsOptional()
  gift_quantity: number;

  @ApiProperty({
    description: 'Product ids',
    example: ['0e723bd6-8c68-4477-be17-5233c8e7b63a'],
  })
  @IsArray()
  book_ids: string[];

  @ApiProperty({
    description: 'Product ids',
    example: ['0e723bd6-8c68-4477-be17-5233c8e7b63a'],
  })
  @IsArray()
  @IsOptional()
  @Type(() => CreatePromotionShockDealConditionDto)
  promotion_shockdeal_conditions: CreatePromotionShockDealConditionDto[];

  @ApiProperty({
    description: 'Product ids',
    example: ['0e723bd6-8c68-4477-be17-5233c8e7b63a'],
  })
  @IsArray()
  @IsOptional()
  @Type(() => CreatePromotionShockDealFreeGiftBookDto)
  promotion_shockdeal_freegift_book: CreatePromotionShockDealFreeGiftBookDto[];
}
export class CreatePromotionShockDealConditionDto {
  @ApiProperty({
    description: 'The discount rate as an integer (e.g., 10 for 10%)',
    example: 15,
  })
  discount_rate: number;

  @ApiProperty({
    description: 'The discount amount as a decimal value',
    example: 9.99,
  })
  discount_amount: Decimal;

  @ApiProperty({
    description: 'The ID of the associated book',
    example: 'f9e8d7c6-b5a4-3210-fedc-ba9876543210',
  })
  book_id: string;
}

export class CreatePromotionShockDealFreeGiftBookDto {
  @ApiProperty({
    description: 'The ID of the free gift book',
    example: 'f9e8d7c6-b5a4-3210-fedc-ba9876543210',
  })
  book_id: string;
}
