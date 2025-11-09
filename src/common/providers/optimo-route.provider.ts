import { OptimoRouteOrderDto } from '@module/intelligence_delivery/dto/optimo-route-order.dto';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

@Injectable()
export class OptimoRouteSDKProvider {
  private readonly axiosInstance: AxiosInstance;
  private apiKey: string | null = null;
  constructor(private readonly configService: ConfigService) {
    this.axiosInstance = axios.create({
      baseURL: 'https://api.optimoroute.com/v1',
      headers: { 'Content-Type': 'application/json' },
    });
    this.apiKey =
      this.configService.get<string>('optimo_route_api_key') || null;
  }
  async createOrder(orderData: OptimoRouteOrderDto) {
    try {
      const url = `/create_order?key=${this.apiKey}`;
      const response = await this.axiosInstance.post(url, orderData);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          `OptimRoute API Error: ${error.response?.data?.message || error.message}`,
        );
      }
      throw new Error(
        `OptimRoute API Error: ${error.response?.data?.message || JSON.stringify(error.response?.data) || error.message}`,
      );
    }
  }

  async createBulkOrders(orders: OptimoRouteOrderDto[]) {
    try {
      console.log('Creating bulk orders:', orders);
      const url = `/create_or_update_orders?key=${this.apiKey}`;
      const response = await this.axiosInstance.post(url, { orders });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          `OptimRoute API Error: ${error.response?.data?.message || error.message}`,
        );
      }
      throw new Error(`OptimRoute SDK Error: ${error.message}`);
    }
  }

  async getScheduleInfomation(
    orderId: string,
  ): Promise<ScheduleInformationDto> {
    try {
      const url = `/get_scheduling_info?key=${this.apiKey}&orderNo=${orderId}`;
      const response = await this.axiosInstance.get(url);
      return response.data as ScheduleInformationDto;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          `OptimRoute API Error: ${error.response?.data?.message || error.message}`,
        );
      }
      throw new Error(`OptimRoute SDK Error: ${error.message}`);
    }
  }

  async startPlanning(
    planningOptions: StartPlanningRequestDto,
  ): Promise<StartPlanningResponseDto> {
    try {
      const url = `/start_planning?key=${this.apiKey}`;
      const response = await this.axiosInstance.post(url, planningOptions);
      return response.data as StartPlanningResponseDto;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          `OptimRoute API Error: ${error.response?.data?.message || error.message}`,
        );
      }
      throw new Error(`OptimRoute SDK Error: ${error.message}`);
    }
  }

  async getRoute(params: GetRouteRequestDto, includePolyline: boolean = false) {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('key', this.apiKey);
      queryParams.append('date', params.date);

      if (includePolyline) {
        queryParams.append('includeRoutePolyline', 'true');
      }

      const url = `/get_routes?${queryParams.toString()}`;
      console.log('Fetching route with URL:', url);
      const response = await this.axiosInstance.get(url);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          `OptimRoute API Error: ${error.response?.data?.message || error.message}`,
        );
      }
      throw new Error(`OptimRoute SDK Error: ${error.message}`);
    }
  }
}

export class ScheduleInformationDto {
  @IsNumber()
  stopNumber: number;

  @IsString()
  scheduledAt: string;

  @IsString()
  scheduledAtDt: string;

  @IsString()
  arrivalTimeDt: string;

  @IsString()
  driverSerial: string;

  @IsOptional()
  @IsString()
  driverExternalId: string | null;

  @IsString()
  driverName: string;

  @IsString()
  vehicleLabel: string;

  @IsString()
  vehicleRegistration: string;

  @IsNumber()
  distance: number;

  @IsNumber()
  travelTime: number;
}

export class OrderScheduleResponseDto {
  @IsBoolean()
  success: boolean;

  @IsBoolean()
  orderScheduled: boolean;

  @ValidateNested()
  @Type(() => ScheduleInformationDto)
  scheduleInformation: ScheduleInformationDto;
}

export class StartPlanningRequestDto {
  @IsString()
  @IsOptional()
  date?: string;
}

export class StartPlanningResponseDto {
  @IsString()
  status: string;

  @IsString()
  @IsOptional()
  message?: string;

  @IsNumber()
  @IsOptional()
  planId?: number;
}

export class GetRouteRequestDto {
  @IsString()
  date: string;
}

export class GetRoutesResponseDto {
  @IsBoolean()
  success: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RouteDto)
  routes: RouteDto[];

  @IsString()
  @IsOptional()
  code?: string;

  @IsString()
  @IsOptional()
  message?: string;
}

export class RouteDto {
  @IsString()
  @IsOptional()
  driverExternalId?: string;

  @IsString()
  driverSerial: string;

  @IsString()
  driverName: string;

  @IsString()
  vehicleRegistration: string;

  @IsString()
  vehicleLabel: string;

  @IsNumber()
  duration: number;

  @IsNumber()
  distance: number;

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

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RouteStopDto)
  stops: RouteStopDto[];

  @IsString()
  @IsOptional()
  routePolyline?: string;
}

export class RouteStopDto {
  @IsNumber()
  stopNumber: number;

  @IsString()
  orderNo: string;

  @IsString()
  id: string;

  @IsString()
  scheduledAt: string;

  @IsString()
  scheduledAtDt: string;

  @IsString()
  arrivalTimeDt: string;

  @IsString()
  address: string;

  @IsString()
  locationName: string;

  @IsString()
  @IsOptional()
  locationNo?: string;

  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;

  @IsNumber()
  distance: number;

  @IsNumber()
  travelTime: number;
}
