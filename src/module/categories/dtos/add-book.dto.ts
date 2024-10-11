import { ArrayMinSize, IsArray, IsNotEmpty } from 'class-validator';

export class AddBooksToCategoryDto {
  @IsArray()
  @IsNotEmpty()
  @ArrayMinSize(1)
  bookIds: string[];
}
