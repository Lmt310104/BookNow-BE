import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthorsController } from './authors.controller';
import { AuthorsSerivce } from './authors.service';

@Module({
  imports: [PrismaModule],
  controllers: [AuthorsController],
  providers: [AuthorsSerivce],
  exports: [AuthorsSerivce],
})
export class AuthorsModule {}
