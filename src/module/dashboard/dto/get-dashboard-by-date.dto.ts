import { IsString } from 'class-validator';

export class GetDashboardByDateDto {
  @IsString()
  date: string;
}
