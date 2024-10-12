import { PartialType } from '@nestjs/swagger';
import { CreateAuthorDto } from 'src/module/authors/dto/create-author.dto';

export class UpdateBookDto extends PartialType(CreateAuthorDto) {}
