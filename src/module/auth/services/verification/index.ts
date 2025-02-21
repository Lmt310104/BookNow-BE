import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/module/prisma/prisma.service';
import { VerificationEmailDto } from '../../dto/verification-email.dto';
import { VerificationPhoneNumberDto } from '../../dto/verification-phone.dto';

@Injectable()
class VerificationEmailService {
  constructor(private prisma: PrismaService) {}
  async verificationEmail(body: VerificationEmailDto) {
    const { token } = body;
    const user = await this.prisma.users.findFirst({
      where: {
        password: token,
      },
    });
    if (!user) {
      throw new BadRequestException('Invalid token');
    }
    await this.prisma.vertifications.update({
      where: {
        user_id: user.id,
        verified_code: token,
      },
      data: {
        is_active: true,
      },
    });
    return {
      message: 'Email verified successfully',
    };
  }
  async verificationPhoneNumber(body: VerificationPhoneNumberDto) {
    try {
      const { phone, code } = body;
      const user = await this.prisma.users.findFirst({
        where: {
          phone: phone,
        },
      });
      if (!user) {
        throw new BadRequestException('Invalid phone number');
      }
      await this.prisma.vertifications.update({
        where: {
          user_id: user.id,
          verified_code: code,
        },
        data: {
          is_active: true,
        },
      });
      return {
        message: 'Phone number verified successfully',
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
export default VerificationEmailService;
