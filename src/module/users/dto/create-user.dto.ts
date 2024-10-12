import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    description: 'The email of a user',
    type: String,
    required: true,
    example: 'lmtoan311@gmail.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;
  @MinLength(8)
  @IsNotEmpty()
  password: string;
  @IsString()
  fullName: string;
  @IsEnum(Role)
  role: Role;
}
