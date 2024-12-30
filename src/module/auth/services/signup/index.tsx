import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
// import { ResendProvider } from 'src/common/providers/nodemailer.provider';
import { PrismaService } from 'src/module/prisma/prisma.service';
import { SignUpByEmailDto, SignUpByPhoneDto } from '../../dto';
import { checkIsExistEmail } from './check-is-exist-user';
import { hashPassword } from 'prisma/seed';
import { createUserWithEmail } from './create-user';
import { EmailService } from 'src/module/email/email.service';
import { Role } from '@prisma/client';
import sendSMS from 'src/services/sms-gateway';

@Injectable()
class SignUpService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private emailService: EmailService,
  ) {}
  public async SignUpByEmail(body: SignUpByEmailDto) {
    const { email, password } = body;
    const isExistedUser = await checkIsExistEmail(email, this.prisma);
    if (isExistedUser) {
      throw new BadRequestException('User already exists', {
        cause: new Error('User already exists'),
      });
    }
    const hashedPassword = await hashPassword(password);
    const new_user = await createUserWithEmail(
      { ...body, hashedPassword },
      this.prisma,
    );
    await this.prisma.vertifications.create({
      data: {
        verified_code: new_user.password,
        user: {
          connect: {
            id: new_user.id,
          },
        },
      },
    });
    const url = `${this.configService.get<string>('url_web')}/verification?token=${hashedPassword}`;
    await this.emailService.sendEmailVerify({
      to: new_user.email,
      subject: 'Verify your account',
      userFirstname: new_user.full_name,
      url: url,
    });
    return {
      message:
        'User created successfully, please check your email to verify your account',
    };
  }
  async signUpWithPhone(dto: SignUpByPhoneDto) {
    try {
      const { phone, password, fullName, birthday, gender } = dto;
      const existingUser = await this.prisma.users.findFirst({
        where: {
          phone,
        },
      });
      if (existingUser) {
        throw new BadRequestException('Phone number already exists', {
          cause: new Error('Phone number already exists'),
        });
      }
      const hashedPassword = await hashPassword(password);
      const newUser = await this.prisma.users.create({
        data: {
          phone,
          full_name: fullName,
          password: hashedPassword,
          role: Role.CUSTOMER,
          birthday: new Date(birthday),
          gender: gender,
        },
      });
      const code = Math.floor(100000 + Math.random() * 900000);
      await this.prisma.vertifications.create({
        data: {
          verified_code: code.toString(),
          user: {
            connect: {
              id: newUser.id,
            },
          },
        },
      });
      const message = `Your verification code is ${code}`;
      await sendSMS({ to: phone, content: message });
      return {
        message:
          'User created successfully, please check your phone to verify your account',
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}

export default SignUpService;
