import { ApiProperty } from '@nestjs/swagger';
import { GroupStatus } from '@prisma/client';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class UpdateGroupStatusDto {
  @IsEnum(GroupStatus)
  @ApiProperty({
    description: 'Group status',
  })
  @IsNotEmpty()
  group_status: GroupStatus;
}
