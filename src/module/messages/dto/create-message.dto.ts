import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateMessageDto {
  @IsString()
  @IsNotEmpty()
  content: string;
  @IsString()
  @IsOptional()
  attachmentId: string;
}
