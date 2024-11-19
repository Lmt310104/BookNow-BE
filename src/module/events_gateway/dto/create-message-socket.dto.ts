import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateMessageSocketDto {
  @IsNotEmpty()
  @IsString()
  content: string;
  @IsOptional()
  @IsString()
  attachmentId: string;
}
