import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsString } from 'class-validator';

export class CreateListCitiesDto {
  @IsArray()
  @ApiProperty({
    description: 'Danh sách các tỉnh/thành phố',
    example: [
      { id: '100000', name: 'Hà Nội' },
      { id: '100001', name: 'Hồ Chí Minh' },
      { id: '100002', name: 'Đà Nẵng' },
    ],
  })
  @Type(() => CityDto)
  cities: CityDto[];
}

export class CreateListDistrictsDto {
  @IsArray()
  @ApiProperty({
    description: 'Danh sách các quận/huyện',
    example: [
      { id: '100000', name: 'Ba Đình', city_id: '100000' },
      { id: '100001', name: 'Hoàn Kiếm', city_id: '100000' },
      { id: '100002', name: 'Đống Đa', city_id: '100000' },
    ],
  })
  @Type(() => DistrictDto)
  districts: DistrictDto[];
}

class DistrictDto {
  @ApiProperty({ example: '100000', description: 'Ward ID' })
  @IsString()
  id: string;

  @ApiProperty({ example: 'Ba Đình', description: 'Ward name' })
  @IsString()
  name: string;

  @ApiProperty({ example: '100000', description: 'City ID' })
  @IsString()
  district_code: string;
}

export class CityDto {
  @ApiProperty({ example: '100000', description: 'City ID' })
  @IsString()
  id: string;

  @ApiProperty({ example: 'Hà Nội', description: 'City name' })
  @IsString()
  name: string;

  @ApiProperty({ example: '100000', description: 'City name' })
  postal_code: string;
}
