import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class GetAddressDto {
  @ApiProperty({
    description: 'Number of items to skip',
    example: 0,
    required: false,
  })
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  skip?: number = 0;

  @ApiProperty({
    description: 'Number of items to take',
    example: 10,
    required: false,
  })
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  take?: number = 10;
}
