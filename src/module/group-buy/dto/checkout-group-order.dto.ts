import { Decimal } from '@prisma/client/runtime/library';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDecimal,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { PAYMENT_METHOD } from 'src/utils/constants';

export class CheckoutGroupOrderDto {
  @IsArray()
  @IsNotEmpty({ message: 'items must not be empty' })
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @Type(() => CheckoutGroupItemDto)
  items: CheckoutGroupMemberItem[];

  @IsString({ message: 'full name is not valid' })
  @IsNotEmpty()
  fullName: string;

  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @IsEnum(PAYMENT_METHOD)
  @IsNotEmpty()
  paymentMethod: PAYMENT_METHOD;

  @IsNotEmpty({ message: 'Address must not be empty ' })
  @IsString()
  address: string;

  @IsArray()
  @IsOptional()
  group_promotion_ids: string[];

  @IsDecimal()
  @IsOptional()
  latitude: Decimal;

  @IsDecimal()
  @IsOptional()
  longitude: Decimal;
}
class CheckoutGroupMemberItem {
  @IsString()
  @IsNotEmpty()
  member_id: string;

  @IsArray()
  @IsNotEmpty({ message: 'items must not be empty' })
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @Type(() => CheckoutGroupItemDto)
  items: CheckoutGroupItemDto[];
}

class CheckoutGroupItemDto {
  @IsString()
  @IsNotEmpty()
  bookId: string;

  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  @Min(1)
  quantity: number;

  @IsArray()
  @IsOptional()
  promotion_ids: string[];
}
