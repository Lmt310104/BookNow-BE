import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { ORDER } from './constants';

export class PageOptionsDto {
  @ApiPropertyOptional({ enum: ORDER, default: ORDER.ASC })
  @IsEnum(ORDER)
  @IsOptional()
  readonly order?: ORDER = ORDER.ASC;

  @ApiPropertyOptional({
    minimum: 1,
    default: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  readonly page?: number = 1;

  @ApiPropertyOptional({
    minimum: 1,
    maximum: 50,
    default: 10,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  @IsOptional()
  readonly take?: number = 10;

  get skip(): number {
    return (this.page - 1) * this.take;
  }
  @ApiPropertyOptional({
    default: 'created_at',
  })
  readonly sortBy?: string = 'created_at';
  @ApiPropertyOptional({
    default: ORDER.DESC,
  })
  readonly sort?: ORDER = ORDER.DESC;

  constructor(pageOptionsDto: Partial<PageOptionsDto> = {}) {
    Object.assign(this, pageOptionsDto);
  }
}
