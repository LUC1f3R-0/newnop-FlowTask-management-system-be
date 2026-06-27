import { Body, Controller, Post, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import {
  LoginDto,
  RegisterDto,
  ResendEmailVerificationDto,
  VerifyDto,
} from './dto/auth.dto.js';
import { AuthService } from './auth.service.js';
import { ResponseMessage } from '../../common/decorators/response-message.decorator.js';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('register')
  @ResponseMessage('User registered successfully. Verification OTP sent.')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @ResponseMessage('Login successful')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.login(dto);

    this.setAuthCookies(response, {
      accessToken: result.tokens.accessToken,
      refreshToken: result.tokens.refreshToken,
      refreshTokenExpiresAt: result.tokens.refreshTokenExpiresAt,
    });

    return {
      user: result.user,
    };
  }

  @Post('logout')
  @ResponseMessage('Logout successful')
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.authService.logout(request);

    this.clearAuthCookies(response);

    return null;
  }

  @Post('refresh')
  @ResponseMessage('Access token refreshed successfully')
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.refreshAccessToken(request);

    this.setAccessTokenCookie(response, result.accessToken);

    return {
      user: result.user,
    };
  }

  @Post('verify-email')
  @ResponseMessage('Email verified successfully')
  async verifyEmail(@Body() dto: VerifyDto) {
    return this.authService.verifyEmail(dto);
  }

  @Post('resend-verification-otp')
  @ResponseMessage('Verification OTP sent successfully')
  async resendVerificationOtp(@Body() dto: ResendEmailVerificationDto) {
    return this.authService.resendVerificationOtp(dto);
  }

  private setAuthCookies(
    response: Response,
    tokens: {
      accessToken: string;
      refreshToken: string;
      refreshTokenExpiresAt: Date;
    },
  ) {
    this.setAccessTokenCookie(response, tokens.accessToken);

    const isProduction =
      this.configService.getOrThrow<string>('app.nodeEnv') === 'production';

    response.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      expires: tokens.refreshTokenExpiresAt,
      path: '/api/v1/auth/refresh',
    });
  }

  private setAccessTokenCookie(response: Response, accessToken: string) {
    const isProduction =
      this.configService.getOrThrow<string>('app.nodeEnv') === 'production';

    response.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000,
      path: '/',
    });
  }

  private clearAuthCookies(response: Response) {
    const isProduction =
      this.configService.getOrThrow<string>('app.nodeEnv') === 'production';

    response.clearCookie('accessToken', {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
    });

    response.clearCookie('refreshToken', {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/api/v1/auth',
    });
  }
}
