import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { ORDER } from './constants';

export class PageQueryDto {
  @ApiProperty({
    description: 'Số lượng mục tối đa được lấy trong mỗi trang.',
    example: 10,
    required: false,
  })
  @IsInt()
  @Type(() => Number)
  @IsOptional()
  take: number = 10;

  @ApiProperty({
    description: 'Số trang cần truy vấn, bắt đầu từ 1.',
    example: 1,
    required: false,
  })
  @IsInt()
  @Type(() => Number)
  @IsOptional()
  page: number = 1;

  get skip(): number {
    return (this.page - 1) * this.take;
  }

  @ApiProperty({ enum: ORDER, default: ORDER.DESC })
  @IsEnum(ORDER)
  @IsOptional()
  readonly order?: ORDER = ORDER.DESC;

  @ApiProperty({
    default: 'created_at',
  })
  @IsOptional()
  readonly sortBy?: string = 'created_at';

  @ApiProperty({
    description: 'Từ khóa tìm kiếm.',
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;
}
