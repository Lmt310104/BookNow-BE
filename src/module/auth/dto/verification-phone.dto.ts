import { IsNotEmpty, IsString } from 'class-validator';

export class VerificationPhoneNumberDto {
  @IsString()
  @IsNotEmpty()
  phone: string;
  @IsString()
  @IsNotEmpty()
  code: string;
}
