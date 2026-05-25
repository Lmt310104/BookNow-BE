import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { PageOptionsDto } from 'src/utils/page-options-dto';

export class GetRecommendationByUserQuery extends PageOptionsDto {
  @IsOptional()
  @ApiPropertyOptional({ description: 'Search term for recommendations' })
  readonly search?: string;
}
