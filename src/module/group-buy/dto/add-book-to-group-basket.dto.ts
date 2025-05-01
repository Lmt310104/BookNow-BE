import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';

export class AddBookToGroupBasketDto {
  @IsString()
  @IsNotEmpty()
  book_id: string;
  @IsNumber()
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  @Min(1)
  quantity: number;
}
