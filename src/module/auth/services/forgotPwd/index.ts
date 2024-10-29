import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailService } from 'src/module/email/email.service';
import { PrismaService } from 'src/module/prisma/prisma.service';
import SendCodeDto from '../../dto/send-code.dto';
import ResetPasswordDto from '../../dto/reset-password.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
class ForgotPwdService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly emailService: EmailService,
  ) {}
  async sendCode(body: SendCodeDto) {
    const { email } = body;
    const user = await this.prisma.users.findUnique({
      where: {
        email,
      },
    });
    if (!user) {
      throw new BadRequestException('User not found', {
        cause: new Error('User not found'),
      });
    }
    const code = Math.floor(100000 + Math.random() * 900000);
    await this.prisma.users.update({
      where: {
        email: email,
      },
      data: {
        code_reset_password: code.toString(),
      },
    });

    const url = `${this.config.get<string>('url_web')}/reset-password?email=${user.email}`;
    const urlToRedirectWithCode = `${this.config.get<string>('url_web')}/reset-password?email=${user.email}&code=${code}`;
    await this.emailService.sendEmailForgotPwd({
      to: user.email,
      subject: 'Reset password',
      userFirstname: user.full_name,
      url: url,
      code: code.toString(),
      urlRedirectWithCode: urlToRedirectWithCode,
    });
    return {
      message: 'Email for reseting password has been sent to your email',
    };
  }

  async postCodeToResetPassword(body: ResetPasswordDto) {
    const { code, newPassword, email } = body;
    const user = await this.prisma.users.findFirst({
      where: {
        email: email,
      },
      select: {
        code_reset_password: true,
      },
    });
    if (!user) {
      throw new BadRequestException('Invalid code', {
        cause: new Error('Invalid code'),
      });
    }
    if (user.code_reset_password !== code) {
      throw new BadRequestException('Invalid code', {
        cause: new Error('Invalid code'),
      });
    }
    const hashedPassword = await this.hashPassword(newPassword);
    await this.prisma.users.update({
      where: {
        email: email,
      },
      data: {
        password: hashedPassword,
        code_reset_password: '',
      },
    });
  }

  private async hashPassword(password: string) {
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);
    return hashed;
  }
}
export default ForgotPwdService;
