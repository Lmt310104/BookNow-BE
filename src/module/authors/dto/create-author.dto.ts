import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateAuthorDto {
  @ApiProperty({
    description: 'The name of the author',
    example: 'John Doe',
  })
  @IsString()
  @IsNotEmpty()
  name: string;
  @ApiProperty({
    description: 'The birthdate of the author',
    example: '1990-01-01T00:00:00.000Z',
  })
  @IsNotEmpty()
  birthday: Date;
  @ApiProperty({
    description: 'The description of the author',
    example: 'John Doe is a famous author',
  })
  @IsString()
  description: string;
}
