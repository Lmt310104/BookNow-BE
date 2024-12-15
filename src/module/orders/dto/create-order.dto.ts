import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { PAYMENT_METHOD } from 'src/utils/constants';

export class OrderItemDto {
  @IsString()
  @IsNotEmpty()
  bookId: string;

  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  @Min(1)
  quantity: number;
}

export class CreateOrderDto {
  @IsArray()
  @IsNotEmpty({ message: 'items must not be empty' })
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

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
}
