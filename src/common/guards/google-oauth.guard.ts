import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GOOGLE_STRATEGY } from 'src/utils/constants';

@Injectable()
export class GoogleOauthGuard extends AuthGuard(GOOGLE_STRATEGY) {}
