import { IsArray, IsOptional, IsString } from 'class-validator';

export class UpdateBookDto {
  @IsString({ message: 'Title is string' })
  @IsOptional({ message: 'Title is required' })
  title: string;

  @IsArray()
  @IsOptional()
  image_url?: string[];
  @IsString()
  @IsOptional()
  categoryId?: string;
  @IsOptional()
  @IsArray()
  authors: string[];

  @IsString()
  @IsOptional()
  supplierId: string;

  @IsString()
  @IsOptional()
  sku: string;

  @IsOptional()
  entryPrice: string;

  @IsOptional()
  description: string;

  @IsOptional()
  price: string;
}
