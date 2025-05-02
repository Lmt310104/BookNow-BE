import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateAddressDto {
  @ApiProperty({
    description: 'Full name of the recipient',
    example: 'John Doe',
    required: false,
  })
  @IsString()
  @IsOptional()
  full_name?: string;

  @ApiProperty({
    description: 'Phone number of the recipient',
    example: '+84123456789',
    required: false,
  })
  @IsString()
  @IsOptional()
  phone_number?: string;

  @ApiProperty({
    description: 'ward name',
    example: 'District 1',
  })
  @IsString()
  @IsOptional()
  ward_name?: string;

  @ApiProperty({
    description: 'Street address',
    example: '123 Main St',
    required: false,
  })
  @IsString()
  @IsOptional()
  street?: string;

  @ApiProperty({
    description: 'District/ward',
    example: 'District 1',
  })
  @IsString()
  @IsOptional()
  district_id?: string;
  @ApiProperty({
    description: 'Postal code',
    example: '70000',
    required: false,
  })
  @ApiProperty({
    description: 'Latitude coordinate',
    example: 10.762622,
    required: false,
  })
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  lat?: number;

  @ApiProperty({
    description: 'Longitude coordinate',
    example: 106.660172,
    required: false,
  })
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  lon?: number;
}
