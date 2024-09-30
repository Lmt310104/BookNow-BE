import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { SignInService, VerificationEmailService } from './services';
import { PrismaModule } from '../prisma/prisma.module';
import SignUpService from './services/signup';
import { EmailService } from '../email/email.service';
import { NodemailerProvider } from 'src/common/providers/nodemailer.provider';
import SignOutService from './services/signout';
import RefreshTokenService from './services/refreshToken';
import ForgotPwdService from './services/forgotPwd';

@Module({
  imports: [JwtModule.register({ global: true }), PrismaModule],
  controllers: [AuthController],
  providers: [
    SignInService,
    EmailService,
    SignUpService,
    NodemailerProvider,
    VerificationEmailService,
    SignOutService,
    RefreshTokenService,
    ForgotPwdService,
  ],
  exports: [JwtModule],
})
export class AuthModule {}
