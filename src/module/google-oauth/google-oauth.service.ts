import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Role, TypeEmail } from '@prisma/client';
import { Response } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class GoogleOauthService {
  constructor(
    private readonly configSerivce: ConfigService,
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
  ) {}
  async googleOauth(
    userPayload: { userData: any; role: Role },
    res: Response<any, Record<string, any>>,
  ) {
    const { userData, role } = userPayload;
    const { emails, photos, displayName } = userData.profile;
    const email = emails[0].value;
    const avatar_url = photos[0].value;
    const full_name = displayName;
    const user = await this.prismaService.users.findFirst({
      where: { email, type_email: TypeEmail.GOOGLE },
    });
    if (!user) {
      res.cookie('email', encodeURIComponent(email));
      res.cookie('avatar_url', encodeURIComponent(avatar_url));
      res.cookie('full_name', encodeURIComponent(full_name));
      res.cookie('role', role);
      res.redirect(this.configSerivce.get<string>('register_page_url'));
      return;
    }
    const { id } = user;
    const { access_token, refresh_token } = await this.generateToken({
      id,
      role: user.role,
    });
    await this.prismaService.users.update({
      where: { id: user.id },
      data: { refresh_token: refresh_token },
    });
    res.cookie('access_token', access_token);
    res.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 10,
    });
    res.redirect(this.configSerivce.get<string>('success_auth_google'));
  }

  private async generateToken<T extends { id: string; role: Role }>(
    payload: T,
  ) {
    const jwtPayload = payload;
    const access_token = await this.jwtService.signAsync(jwtPayload, {
      secret: this.configSerivce.get('jwt_access_secret'),
      expiresIn: '300s',
    });
    const refresh_token = await this.jwtService.signAsync(jwtPayload, {
      secret: this.configSerivce.get('jwt_refresh_secret'),
      expiresIn: '10d',
    });
    return { access_token, refresh_token };
  }
}
