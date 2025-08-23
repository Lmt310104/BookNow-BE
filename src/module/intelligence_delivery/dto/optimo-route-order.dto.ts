import { Type } from 'class-transformer';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsArray,
  ValidateNested,
  IsObject,
  IsDate,
} from 'class-validator';

export class OptimoRouteOrderLocationDto {
  @IsString()
  @IsOptional()
  locationNo?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  locationName?: string;

  @IsNumber()
  @IsOptional()
  latitude?: number;

  @IsNumber()
  @IsOptional()
  longitude?: number;

  @IsNumber()
  @IsOptional()
  checkInTime?: number;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class OptimoRouteTimeWindowDto {
  @IsString()
  @IsOptional()
  twFrom: string;

  @IsString()
  @IsOptional()
  twTo: string;
}

export class OptimoRouteDriverDto {
  @IsString()
  @IsOptional()
  externalId?: string;

  @IsString()
  @IsOptional()
  serial?: string;
}

export class OptimoRouteOrderDto {
  @IsString()
  orderNo: string;

  @IsString()
  date: string;

  @IsNumber()
  @IsOptional()
  duration?: number;

  @IsString()
  @IsOptional()
  priority?: string;

  @IsString()
  @IsOptional()
  type?: string;

  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => OptimoRouteDriverDto)
  assignedTo?: OptimoRouteDriverDto;

  @IsObject()
  @ValidateNested()
  @Type(() => OptimoRouteOrderLocationDto)
  location: OptimoRouteOrderLocationDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OptimoRouteTimeWindowDto)
  @IsOptional()
  timeWindows?: OptimoRouteTimeWindowDto[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  allowedWeekdays?: string[];

  @IsObject()
  @IsOptional()
  allowedDates?: any;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  skills?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  vehicleFeatures?: string[];

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  customField1?: string;

  @IsString()
  @IsOptional()
  notificationPreference?: string;

  @IsNumber()
  @IsOptional()
  load1?: number;

  @IsNumber()
  @IsOptional()
  load2?: number;

  @IsNumber()
  @IsOptional()
  load3?: number;

  @IsNumber()
  @IsOptional()
  load4?: number;
}

export class OptimoRouteBulkOrdersRequestDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OptimoRouteOrderDto)
  orders: OptimoRouteOrderDto[];
}
