import { IsNotEmpty, IsNumber } from 'class-validator';

export class RatingFilterDto {
  @IsNumber()
  @IsNotEmpty()
  rating: number;
}
