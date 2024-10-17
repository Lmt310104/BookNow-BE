import { IsNumber, Max, Min } from 'class-validator';

export class GetDashboardDto {
  @IsNumber()
  @Min(1)
  @Max(12)
  month: number;
  @IsNumber()
  year: number;
}
