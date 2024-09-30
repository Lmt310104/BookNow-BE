import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { NodemailerProvider } from 'src/common/providers/nodemailer.provider';
import { ConfigModule } from '@nestjs/config';

@Module({
  providers: [EmailService, NodemailerProvider],
  imports: [ConfigModule],
  exports: [EmailService],
})
export class EmailModule {}
