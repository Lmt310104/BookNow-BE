import { ApiProperty } from '@nestjs/swagger';
import { PromotionCategory, PromotionStatus } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';
import { PageQueryDto } from 'src/utils/refactor-page-query.dto';

export class FindAllPromotionDto extends PageQueryDto {
  @ApiProperty({
    description: 'Filter promotion by isActive',
  })
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsOptional()
  is_active?: boolean;

  @ApiProperty({
    description: 'Filter promotions by name (partial match)',
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'Filter promotions by category',
    enum: PromotionCategory,
    required: false,
  })
  @IsEnum(PromotionCategory)
  @IsOptional()
  promotion_category?: PromotionCategory;

  @ApiProperty({
    description: 'Filter promotions by status',
    enum: PromotionStatus,
    required: false,
  })
  @IsEnum(PromotionStatus)
  @IsOptional()
  status?: PromotionStatus;

  @ApiProperty({
    description: 'Filter promotions by start date (greater than or equal to)',
    type: Date,
    required: false,
  })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  start_date?: Date;
  @ApiProperty({
    description: 'Filter promotions by end date (less than or equal to)',
    type: Date,
    required: false,
  })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  end_date?: Date;
}
