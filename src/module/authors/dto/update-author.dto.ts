import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateAuthorDto {
  @IsString()
  @IsNotEmpty()
  id: string;
  @IsString()
  @IsNotEmpty()
  name: string;
  @IsNotEmpty()
  birthday: Date;
  @IsString()
  description: string;
}
