import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { PROMOTION_TYPE } from 'src/utils/constants';
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
  @IsEnum(PROMOTION_TYPE)
  @IsNotEmpty()
  promotion_type?: PROMOTION_TYPE;
}
