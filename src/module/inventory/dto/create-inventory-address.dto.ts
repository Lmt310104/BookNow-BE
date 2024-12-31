import { InventoryType } from '@prisma/client';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateInventoryAddressDto {
  @IsString()
  @IsNotEmpty()
  name: string;
  @IsString()
  @IsNotEmpty()
  type: InventoryType;
  @IsNotEmpty()
  @IsString()
  address: string;
  @IsString()
  @IsOptional()
  note: string;
}
