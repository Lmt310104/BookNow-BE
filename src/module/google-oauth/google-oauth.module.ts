import { Module } from '@nestjs/common';
import { GoogleOauthController } from './google-oauth.controller';
import { GoogleOauthStrategy } from './google-oauth.provider';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from '../prisma/prisma.module';
import { GoogleOauthService } from './google-oauth.service';

@Module({
  controllers: [GoogleOauthController],
  providers: [GoogleOauthStrategy, GoogleOauthService],
  imports: [JwtModule.register({ global: true }), PrismaModule],
})
export class GoogleOauthModule {}
