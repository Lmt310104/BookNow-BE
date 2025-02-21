import { InventoryFormState, InventoryFormType } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class CreateInventoryFormDto {
  @IsEnum(InventoryFormType)
  @IsNotEmpty()
  type: InventoryFormType;
  @IsEnum(InventoryFormState)
  @IsNotEmpty()
  state: InventoryFormState;
  @IsOptional()
  @IsString()
  note?: string;
  @IsString()
  @IsNotEmpty()
  expected_date: string;
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateInventoryFormItemDto)
  items: CreateInventoryFormItemDto[];
}

class CreateInventoryFormItemDto {
  @IsString()
  @IsNotEmpty()
  sku: string;
  @IsNotEmpty()
  @IsInt()
  expected_quantity: number;
  @IsNotEmpty()
  @IsNumber()
  entry_price: number;
  @IsNotEmpty()
  @IsNumber()
  quantity: number;
  @IsNumber()
  @IsNotEmpty()
  selling_price: number;
}
