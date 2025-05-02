import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAddressDto {
  @ApiProperty({
    description: 'Full name of the recipient',
    example: 'John Doe',
  })
  @IsString()
  @IsNotEmpty()
  full_name: string;

  @ApiProperty({
    description: 'Phone number of the recipient',
    example: '+84123456789',
  })
  @IsString()
  @IsNotEmpty()
  phone_number: string;

  @ApiProperty({
    description: 'Street address',
    example: '123 Main St',
  })
  @IsString()
  @IsNotEmpty()
  street: string;

  @ApiProperty({
    description: 'ward name',
    example: 'District 1',
  })
  @IsString()
  @IsOptional()
  ward_name?: string;

  @ApiProperty({
    description: 'District/ward',
    example: 'District 1',
  })
  @IsString()
  @IsNotEmpty()
  district_id: string;

  @ApiProperty({
    description: 'Latitude coordinate',
    example: 10.762622,
  })
  @IsNumber()
  @Type(() => Number)
  @IsNotEmpty()
  lat: number;

  @ApiProperty({
    description: 'Longitude coordinate',
    example: 106.660172,
  })
  @IsNumber()
  @Type(() => Number)
  @IsNotEmpty()
  lon: number;
}
