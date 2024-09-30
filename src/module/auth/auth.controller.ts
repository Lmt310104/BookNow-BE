import { Body, Controller, Delete, Get, Post, Req, Res } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DOCUMENTATION, END_POINTS } from 'src/utils/constants';
import { SignInService, VerificationEmailService } from './services';
import { SignInByEmailDto, SignInByPhoneDto, SignUpByEmailDto } from './dto';
import { Response } from 'express';
import SignUpService from './services/signup';
import { VerificationEmailDto } from './dto/verification-email.dto';
import SignOutService from './services/signout';
import RefreshTokenService from './services/refreshToken';
import SendCodeDto from './dto/send-code.dto';
import ForgotPwdService from './services/forgotPwd';
import ResetPasswordDto from './dto/reset-password.dto';

const {
  AUTH: {
    BASE,
    SIGN_IN: { BASE_SIGN_IN, EMAIL, PHONE },
    SIGN_UP,
    SIGN_OUT,
    REFRESH,
    FORGOT_PASSWORD,
    RESET_PASSWORD,
    VERIFY_EMAIL,
  },
} = END_POINTS;

@ApiTags(DOCUMENTATION.TAGS.AUTH)
@Controller(BASE)
export class AuthController {
  constructor(
    private readonly signInService: SignInService,
    private readonly signUpService: SignUpService,
    private readonly verificationService: VerificationEmailService,
    private readonly signOutService: SignOutService,
    private readonly refreshTokenService: RefreshTokenService,
    private readonly forgotPwdService: ForgotPwdService,
  ) {}
  @ApiOperation({ summary: 'Sign in by email' })
  @ApiResponse({
    status: 200,
    description: 'Sign in successfully',
    schema: {
      example: {
        access_token: 'string',
        user_id: 'string',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @Post(`${BASE_SIGN_IN}${EMAIL}`)
  async signInByEmail(
    @Body() body: SignInByEmailDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return await this.signInService.SignInByEmail(body, res);
  }
  @ApiOperation({ summary: 'Sign in by phone number' })
  @Post(`${BASE_SIGN_IN}${PHONE}`)
  async signInByPhone(
    @Body() body: SignInByPhoneDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.signInService.SignInByPhone(body, res);
  }
  @ApiOperation({ summary: 'Sign up by email' })
  @ApiResponse({
    status: 201,
    description: 'Sign up successfully',
    schema: {
      example: {
        message:
          'User created successfully, please check your email to verify your account.',
      },
    },
  })
  @Post(`${SIGN_UP.BASE_SIGN_UP}${SIGN_UP.EMAIL}`)
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async signUpByEmail(@Body() body: SignUpByEmailDto) {
    return await this.signUpService.SignUpByEmail(body);
  }
  @ApiOperation({ summary: 'Sign out' })
  @ApiResponse({
    status: 200,
    description: 'Sign out successfully',
    schema: {
      example: {
        message: 'Sign out successfully',
      },
    },
  })
  @Delete(SIGN_OUT)
  async signOut(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    return await this.signOutService.signOut(req, res);
  }

  @ApiOperation({ summary: 'Refresh token' })
  @ApiResponse({
    status: 200,
    description: 'Return new access token and refresh token',
    schema: {
      example: {
        access_token: 'string',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'When refresh token expired or incorrect',
  })
  @Get(REFRESH)
  async getRefreshToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    return await this.refreshTokenService.getRefreshToken(req, res);
  }

  @ApiOperation({ summary: 'Forgot password' })
  @ApiResponse({
    status: 200,
    description: 'Send email successfully',
    schema: {
      example: {
        message: 'Email has been sent',
      },
    },
  })
  @Post(FORGOT_PASSWORD)
  async getForgotPassword(@Body() body: SendCodeDto) {
    return await this.forgotPwdService.sendCode(body);
  }
  @ApiOperation({ summary: 'Reset password' })
  @ApiResponse({
    status: 201,
    description: 'Reset password successfully',
    schema: {
      example: {
        message: 'Password has been reset',
      },
    },
  })
  @Post(RESET_PASSWORD)
  async postForgotPassword(@Body() body: ResetPasswordDto) {
    return await this.forgotPwdService.postCodeToResetPassword(body);
  }
  @ApiOperation({ summary: 'Verification email' })
  @ApiResponse({
    status: 201,
    description: 'Verification successfully',
    schema: {
      example: {
        message: 'Verification successfully',
      },
    },
  })
  @Post(VERIFY_EMAIL)
  verificationEmail(@Body() body: VerificationEmailDto) {
    return this.verificationService.verificationEmail(body);
  }
}
