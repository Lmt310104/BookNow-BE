import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsString,
  IsNumber,
  IsArray,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateAuthorDto } from 'src/module/authors/dto/create-author.dto';
import { BOOKSTATUS } from 'src/utils/constants';

export class CreateBookDto {
  @ApiProperty({
    description: 'The title of a book',
    type: String,
    required: true,
    example: 'The Great Gatsby',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'The author id of a book',
    required: true,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  authorId: string;

  @ApiProperty({
    description: 'The author of a book',
    type: CreateAuthorDto,
  })
  author?: CreateAuthorDto;

  @ApiProperty({
    description: 'The category id of a book',
    required: true,
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @IsUUID()
  @IsNotEmpty()
  categoryId: string;

  @ApiProperty({
    description: 'The entry price of a book',
    required: true,
    example: 100000,
  })
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  entryPrice: number;

  @ApiProperty({
    description: 'The sale price of a book',
    required: true,
    example: 200000,
  })
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  price: number;

  @ApiProperty({
    description: 'The number of books in stock',
    required: true,
    example: 10,
  })
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  stockQuantity: number;

  @ApiProperty({
    description: 'The description of a book',
    required: true,
    example: 'This is a great book',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'The images of a book',
    required: true,
    example: ['https://image.com/book1.jpg'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  images: string[];

  @ApiProperty({
    description: 'The status of a book',
    required: true,
    enum: BOOKSTATUS,
    example: BOOKSTATUS.INSTOCK,
  })
  @IsEnum(BOOKSTATUS)
  @IsNotEmpty()
  status: BOOKSTATUS;
}
