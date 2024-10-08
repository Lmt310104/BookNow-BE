import { ApiProperty } from '@nestjs/swagger';

export class CreateAuthorDto {
  @ApiProperty({
    description: 'The name of the author',
    example: 'John Doe',
  })
  name: string;
  @ApiProperty({
    description: 'The birthdate of the author',
    example: '1990-01-01T00:00:00.000Z',
  })
  birthday: Date;
  @ApiProperty({
    description: 'The description of the author',
    example: 'John Doe is a famous author',
  })
  description: string;
}
