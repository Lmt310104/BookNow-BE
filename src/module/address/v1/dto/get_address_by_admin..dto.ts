import { IsOptional, IsString } from 'class-validator';
import { PageOptionsDto } from 'src/utils/page-options-dto';

export class GetAllAddressByAdminDto extends PageOptionsDto {
  @IsString()
  @IsOptional()
  search: string;
}
