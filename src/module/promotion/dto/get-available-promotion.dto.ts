import { ApiProperty } from '@nestjs/swagger';
import { PromotionCategory } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { PageOptionsDto } from 'src/utils/page-options-dto';

export class GetAvailableBookForPromotionDto extends PageOptionsDto {
  @ApiProperty({
    description: 'Filter promotions by book name',
    required: false,
  })
  @IsString()
  @IsOptional()
  book_name?: string;

  @ApiProperty({
    description: 'Promotion type',
    required: false,
  })
  @IsEnum(PromotionCategory)
  @IsNotEmpty()
  promotion_type?: PromotionCategory;
}
