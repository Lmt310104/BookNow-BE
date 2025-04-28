import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty, ValidateIf } from 'class-validator';

export class EditTimePromotionDto {
  @ApiProperty({
    description: 'New start date for the promotion (must be before end_date)',
    example: '2025-05-01T00:00:00.000Z',
    type: Date,
  })
  @IsDate()
  @Type(() => Date)
  @ValidateIf((o) => o.end_date === undefined || o.start_date !== undefined)
  @IsNotEmpty()
  start_date: Date;

  @ApiProperty({
    description: 'New end date for the promotion (must be after start_date)',
    example: '2025-05-31T23:59:59.000Z',
    type: Date,
  })
  @IsDate()
  @Type(() => Date)
  @ValidateIf((o) => o.start_date === undefined || o.end_date !== undefined)
  @IsNotEmpty()
  end_date: Date;
}
