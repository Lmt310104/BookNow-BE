import { Body, Controller, Post, Res } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DOCUMENTATION, END_POINTS } from 'src/utils/constants';
import { SignInService } from './services';
import { SignInByEmailDto, SignInByPhoneDto } from './dto';
import { Response } from 'express';

const {
  AUTH: {
    BASE,
    SIGN_IN: { BASE_SIGN_IN, EMAIL, PHONE },
    SIGN_UP,
    SIGN_OUT,
    REFRESH,
    GET_ME,
    FORGOT_PASSWORD,
    RESET_PASSWORD,
    VERIFY_EMAIL,
  },
} = END_POINTS;

@ApiTags(DOCUMENTATION.TAGS.AUTH)
@Controller(BASE)
export class AuthController {
  constructor(private readonly signInService: SignInService) {}
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
  signInByEmail(
    @Body() body: SignInByEmailDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.signInService.SignInByEmail(body, res);
  }
  @ApiOperation({ summary: 'Sign in by phone number' })

  @Post(`${BASE_SIGN_IN}${PHONE}`)
  signInByPhone(
    @Body() body: SignInByPhoneDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.signInService.SignInByPhone(body, res);
  }
}
