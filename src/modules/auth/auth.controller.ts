import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import type { CookieOptions, Request, Response } from 'express';
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

  @Get('me')
  @ResponseMessage('Authenticated user fetched successfully')
  async me(@Req() request: Request) {
    return this.authService.me(request);
  }

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

    response.cookie(
      'refreshToken',
      tokens.refreshToken,
      this.getCookieOptions({
        path: '/api/v1/auth',
        expires: tokens.refreshTokenExpiresAt,
      }),
    );
  }

  private setAccessTokenCookie(response: Response, accessToken: string) {
    response.cookie(
      'accessToken',
      accessToken,
      this.getCookieOptions({
        path: '/',
        maxAge: 15 * 60 * 1000,
      }),
    );
  }

  private clearAuthCookies(response: Response) {
    response.clearCookie(
      'accessToken',
      this.getClearCookieOptions({
        path: '/',
      }),
    );

    response.clearCookie(
      'refreshToken',
      this.getClearCookieOptions({
        path: '/api/v1/auth',
      }),
    );
  }

  private getCookieOptions(options: {
    path: string;
    maxAge?: number;
    expires?: Date;
  }): CookieOptions {
    const isProduction = this.isProduction();

    return {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',

      path: options.path,
      ...(options.maxAge ? { maxAge: options.maxAge } : {}),
      ...(options.expires ? { expires: options.expires } : {}),
    };
  }

  private getClearCookieOptions(options: { path: string }): CookieOptions {
    const isProduction = this.isProduction();

    return {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      path: options.path,
    };
  }

  private isProduction() {
    return (
      this.configService.getOrThrow<string>('app.nodeEnv') === 'production'
    );
  }
}
