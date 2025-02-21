import { IsOptional, IsString } from 'class-validator';

export class UpdateAuthorDto {
  @IsString()
  @IsOptional()
  id: string;
  @IsString()
  @IsOptional()
  name: string;
  @IsOptional()
  @IsOptional()
  birthday: Date;
  @IsString()
  @IsOptional()
  description: string;
}
