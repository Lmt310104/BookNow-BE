import { Transform } from 'class-transformer';
import {
  IsString,
  IsDate,
  IsOptional,
  IsNumber,
  IsEmail,
} from 'class-validator';

export class OrderExportDto {
  @IsString()
  id: string;

  @IsDate()
  @Transform(({ value }) => new Date(value), { toClassOnly: true })
  createdAt: Date;

  @IsString()
  shippingAddress: string;

  @IsOptional()
  @IsNumber()
  latitude?: number | null;

  @IsOptional()
  @IsNumber()
  longitude?: number | null;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value ?? 'Anonymous Customer')
  customerName?: string;

  @IsOptional()
  @IsEmail()
  @Transform(({ value }) => value ?? null)
  customerEmail?: string | null;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value ?? null)
  customerPhone?: string | null;
}
