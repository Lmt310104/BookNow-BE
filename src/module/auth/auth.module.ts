import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { SignInService } from './services';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [JwtModule.register({ global: true }), PrismaModule],
  controllers: [AuthController],
  providers: [SignInService],
  exports: [JwtModule],
})
export class AuthModule {}
