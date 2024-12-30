import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateSupplierDto {
  @ApiProperty({
    description: 'The name of a supplier',
    type: String,
    required: true,
    example: 'PT. ABC',
  })
  @IsString({ message: 'Name is string' })
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @ApiProperty({
    description: 'The address of a supplier',
    example: 'Jl. ABC No. 123',
  })
  @IsNotEmpty({ message: 'address is required' })
  address: string;

  @ApiProperty({
    description: 'The phone number of a supplier',
    required: true,
    example: '081234567890',
  })
  @IsString()
  @IsNotEmpty({ message: 'phone is required' })
  phone: string;

  @ApiProperty({
    description: 'The email of a supplier',
    required: true,
    example: 'supplier@gmail.com',
  })
  @IsString()
  @IsNotEmpty({ message: 'email is required' })
  email: string;
}
