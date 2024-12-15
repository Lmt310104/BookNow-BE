import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { PAYMENT_METHOD } from 'src/utils/constants';

export class CheckOutDto {
  @IsString()
  @IsNotEmpty()
  fullName: string;
  @IsString()
  @IsNotEmpty()
  shippingAddress: string;
  @IsString()
  @IsNotEmpty()
  phone: string;
  @IsEnum(PAYMENT_METHOD)
  @IsNotEmpty()
  paymentMethod: PAYMENT_METHOD;
}
