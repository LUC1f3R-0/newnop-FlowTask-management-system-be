import * as bcrypt from 'bcrypt';
import {
  LoginDto,
  RegisterDto,
  ResendEmailVerificationDto,
  VerifyDto,
} from './dto/auth.dto.js';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthRepository } from './auth.repository.js';
import { Role } from '../../../generated/prisma/enums.js';
import { randomInt, randomUUID } from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import { SmtpService } from '../../infastructure/smtp/smtp.service.js';

const SALT_ROUNDS = 12;

const ACCESS_TOKEN_EXPIRES_IN = '15m';
const REFRESH_TOKEN_EXPIRES_DAYS = 7;
const EMAIL_OTP_EXPIRES_MINUTES = 10;

type PublicUserInput = {
  uuid: string;
  name: string;
  email: string;
  role: Role;
  isEmailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
};

type RefreshTokenPayload = {
  sub: string;
  sid: string;
  type: 'refresh';
};

type AccessTokenPayload = {
  sub: string;
  role: Role;
  type: 'access';
};

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly smtpService: SmtpService,
  ) {}

  async me(request: Request) {
    const accessToken = this.getCookie(request, 'accessToken');

    if (!accessToken) {
      throw new UnauthorizedException('Access token is missing');
    }

    const payload = await this.verifyAccessToken(accessToken);

    const user = await this.authRepository.findUserByUuid(payload.sub);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      user: this.toPublicUser(user),
    };
  }

  async register(dto: RegisterDto) {
    const email = dto.email.toLowerCase().trim();

    const existingUser = await this.authRepository.findUserByEmail(email);

    if (existingUser?.isEmailVerified) {
      throw new ConflictException('Email already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);

    const otp = this.generateOtp();
    const otpHash = await bcrypt.hash(otp, SALT_ROUNDS);
    const otpExpiresAt = this.getOtpExpiryDate();

    let user: PublicUserInput;

    if (existingUser && !existingUser.isEmailVerified) {
      user = await this.authRepository.updatePendingRegistration({
        userId: existingUser.id,
        name: dto.fullName,
        password: passwordHash,
        otpHash,
        otpExpiresAt,
      });
    } else {
      user = await this.authRepository.createUser({
        name: dto.fullName,
        email,
        password: passwordHash,
        otpHash,
        otpExpiresAt,
      });
    }

    await this.smtpService.sendVerificationOtp({
      to: email,
      otp,
    });

    return {
      user: this.toPublicUser(user),
    };
  }

  async login(dto: LoginDto) {
    const email = dto.email.toLowerCase().trim();

    const existingUser = await this.authRepository.findUserByEmail(email);

    if (!existingUser) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(
      dto.password,
      existingUser.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!existingUser.isEmailVerified) {
      await this.sendFreshVerificationOtp(existingUser.id, existingUser.email);

      throw new ForbiddenException({
        code: 'EMAIL_NOT_VERIFIED',
        message:
          'Please verify your email before logging in. A new OTP has been sent.',
        email: existingUser.email,
      });
    }

    const sessionUuid = randomUUID();
    const refreshTokenExpiresAt = this.getRefreshTokenExpiryDate();

    const accessToken = await this.createAccessToken({
      userUuid: existingUser.uuid,
      role: existingUser.role,
    });

    const refreshToken = await this.createRefreshToken({
      userUuid: existingUser.uuid,
      sessionUuid,
    });

    const refreshTokenHash = await bcrypt.hash(refreshToken, SALT_ROUNDS);

    await this.authRepository.createSession({
      uuid: sessionUuid,
      userId: existingUser.id,
      refreshTokenHash,
      expiresAt: refreshTokenExpiresAt,
    });

    return {
      user: this.toPublicUser(existingUser),
      tokens: {
        accessToken,
        refreshToken,
        refreshTokenExpiresAt,
      },
    };
  }

  async logout(request: Request) {
    const refreshToken = this.getCookie(request, 'refreshToken');

    if (!refreshToken) {
      return;
    }

    try {
      const payload = await this.verifyRefreshToken(refreshToken);

      const session = await this.authRepository.findActiveSessionByUuid(
        payload.sid,
      );

      if (!session) {
        return;
      }

      if (session.user.uuid !== payload.sub) {
        return;
      }

      const isRefreshTokenValid = await bcrypt.compare(
        refreshToken,
        session.refreshTokenHash,
      );

      if (!isRefreshTokenValid) {
        return;
      }

      await this.authRepository.deleteSessionByUuid(payload.sid);
    } catch {
      return;
    }
  }

  // private async verifyAccessToken(accessToken: string) {
  //   let payload: AccessTokenPayload;

  //   try {
  //     payload = await this.jwtService.verifyAsync<AccessTokenPayload>(
  //       accessToken,
  //       {
  //         secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
  //       },
  //     );
  //   } catch {
  //     throw new UnauthorizedException('Invalid or expired access token');
  //   }

  //   if (payload.type !== 'access') {
  //     throw new UnauthorizedException('Invalid token type');
  //   }

  //   if (!payload.sub || !payload.role) {
  //     throw new UnauthorizedException('Invalid access token payload');
  //   }

  //   return payload;
  // }

  async refreshAccessToken(request: Request) {
    const refreshToken = request.cookies?.refreshToken;

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is missing');
    }

    const payload = await this.verifyRefreshToken(refreshToken);

    const session = await this.authRepository.findActiveSessionByUuid(
      payload.sid,
    );

    if (!session) {
      throw new UnauthorizedException('Invalid refresh session');
    }

    if (session.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh session expired');
    }

    if (session.user.uuid !== payload.sub) {
      throw new UnauthorizedException('Invalid refresh token owner');
    }

    const isRefreshTokenValid = await bcrypt.compare(
      refreshToken,
      session.refreshTokenHash,
    );

    if (!isRefreshTokenValid) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const accessToken = await this.createAccessToken({
      userUuid: session.user.uuid,
      role: session.user.role,
    });

    return {
      accessToken,
      user: this.toPublicUser(session.user),
    };
  }

  async verifyEmail(dto: VerifyDto) {
    const email = dto.email.toLowerCase().trim();

    const user = await this.authRepository.findUserByEmail(email);

    if (!user) {
      throw new BadRequestException('Invalid verification request');
    }

    if (user.isEmailVerified) {
      throw new BadRequestException('Email is already verified');
    }

    if (!user.OTPHashed || !user.OTPExpiredAt) {
      throw new BadRequestException('No active OTP found');
    }

    if (user.OTPExpiredAt < new Date()) {
      throw new BadRequestException('OTP expired. Please request a new OTP');
    }

    const isOtpValid = await bcrypt.compare(dto.otp, user.OTPHashed);

    if (!isOtpValid) {
      throw new BadRequestException('Invalid OTP');
    }

    const verifiedUser = await this.authRepository.markEmailAsVerified(user.id);

    return {
      user: this.toPublicUser(verifiedUser),
    };
  }

  async resendVerificationOtp(dto: ResendEmailVerificationDto) {
    const email = dto.email.toLowerCase().trim();

    const user = await this.authRepository.findUserByEmail(email);

    if (!user) {
      throw new BadRequestException('Invalid verification request');
    }

    if (user.isEmailVerified) {
      throw new BadRequestException('Email is already verified');
    }

    const otp = this.generateOtp();
    const otpHash = await bcrypt.hash(otp, SALT_ROUNDS);
    const otpExpiresAt = this.getOtpExpiryDate();

    await this.authRepository.updateEmailVerificationOtp({
      userId: user.id,
      otpHash,
      otpExpiresAt,
    });

    await this.smtpService.sendVerificationOtp({
      to: email,
      otp,
    });

    return {
      email,
    };
  }

  private async verifyAccessToken(accessToken: string) {
    let payload: AccessTokenPayload;

    try {
      payload = await this.jwtService.verifyAsync<AccessTokenPayload>(
        accessToken,
        {
          secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
        },
      );
    } catch {
      throw new UnauthorizedException('Invalid or expired access token');
    }

    if (payload.type !== 'access') {
      throw new UnauthorizedException('Invalid token type');
    }

    if (!payload.sub || !payload.role) {
      throw new UnauthorizedException('Invalid access token payload');
    }

    return payload;
  }

  private getCookie(request: Request, name: string): string | undefined {
    const cookies = request.cookies as Record<string, unknown> | undefined;

    const value = cookies?.[name];

    if (typeof value !== 'string') {
      return undefined;
    }

    return value;
  }

  private async verifyRefreshToken(refreshToken: string) {
    let payload: RefreshTokenPayload;

    try {
      payload = await this.jwtService.verifyAsync<RefreshTokenPayload>(
        refreshToken,
        {
          secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
        },
      );
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Invalid token type');
    }

    if (!payload.sub || !payload.sid) {
      throw new UnauthorizedException('Invalid refresh token payload');
    }

    return payload;
  }

  private async createAccessToken(payload: { userUuid: string; role: Role }) {
    return this.jwtService.signAsync(
      {
        sub: payload.userUuid,
        role: payload.role,
        type: 'access',
      },
      {
        secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
        expiresIn: ACCESS_TOKEN_EXPIRES_IN,
      },
    );
  }

  private async createRefreshToken(payload: {
    userUuid: string;
    sessionUuid: string;
  }) {
    return this.jwtService.signAsync(
      {
        sub: payload.userUuid,
        sid: payload.sessionUuid,
        type: 'refresh',
      },
      {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
        expiresIn: `${REFRESH_TOKEN_EXPIRES_DAYS}d`,
      },
    );
  }

  private getRefreshTokenExpiryDate() {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRES_DAYS);
    return expiresAt;
  }

  private toPublicUser(user: PublicUserInput) {
    return {
      uuid: user.uuid,
      name: user.name,
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  private generateOtp() {
    return randomInt(10000, 100000).toString();
  }

  private getOtpExpiryDate() {
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + EMAIL_OTP_EXPIRES_MINUTES);
    return expiresAt;
  }

  private async sendFreshVerificationOtp(userId: bigint, email: string) {
    const otp = this.generateOtp();
    const otpHash = await bcrypt.hash(otp, SALT_ROUNDS);
    const otpExpiresAt = this.getOtpExpiryDate();

    await this.authRepository.updateEmailVerificationOtp({
      userId,
      otpHash,
      otpExpiresAt,
    });

    await this.smtpService.sendVerificationOtp({
      to: email,
      otp,
    });
  }
}
