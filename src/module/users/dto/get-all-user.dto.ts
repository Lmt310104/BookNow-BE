import { IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { ROLE } from 'src/utils/constants';
import { PageOptionsDto } from 'src/utils/page-options-dto';

export class GetAllUserDto extends PageOptionsDto {
  @IsEnum(ROLE)
  role: ROLE = ROLE.CUSTOMER;
  @IsBoolean()
  @IsOptional()
  isDisabled: boolean = false;
}
