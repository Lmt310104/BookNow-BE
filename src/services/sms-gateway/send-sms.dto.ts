import { IsNotEmpty } from 'class-validator';

export class SendSMSDto {
  @IsNotEmpty()
  to: string;
  @IsNotEmpty()
  content: string;
}
