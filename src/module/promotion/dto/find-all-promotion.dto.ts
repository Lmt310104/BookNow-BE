import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PageQueryDto } from 'src/utils/refactor-page-query.dto';

export class FindAllPromotionDto extends PageQueryDto {
  @ApiProperty({
    description: 'Filter promotion by isActive',
  })
  @IsString()
  @IsOptional()
  isActive?: boolean;
}
