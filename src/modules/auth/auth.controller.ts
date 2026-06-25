import { Body, Controller, Post, Res } from '@nestjs/common';
import type { Response } from 'express';
import { LoginDto, RegisterDto } from './dto/auth.dto.js';
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
  @ResponseMessage('User registered successfully')
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

  private setAuthCookies(
    response: Response,
    tokens: {
      accessToken: string;
      refreshToken: string;
      refreshTokenExpiresAt: Date;
    },
  ) {
    const isProduction =
      this.configService.getOrThrow<string>('app.nodeEnv') === 'production';

    response.cookie('accessToken', tokens.accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000,
      path: '/',
    });

    response.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      expires: tokens.refreshTokenExpiresAt,
      path: '/api/v1/auth/refresh',
    });
  }
}
