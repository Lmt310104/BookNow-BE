import { Module } from '@nestjs/common';
import { AddressController } from './address.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { AddressService } from './address.service';

@Module({
  imports: [PrismaModule],
  controllers: [AddressController],
  providers: [AddressService],
})
export class AddressModule {}
