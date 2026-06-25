import * as bcrypt from 'bcrypt';
import { LoginDto, RegisterDto } from './dto/auth.dto.js';
import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthRepository } from './auth.repository.js';
import { Role } from '../../../generated/prisma/enums.js';
import { randomUUID } from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

const SALT_ROUNDS = 12;

const ACCESS_TOKEN_EXPIRES_IN = '15m';
const REFRESH_TOKEN_EXPIRES_DAYS = 7;

type PublicUserInput = {
  uuid: string;
  name: string;
  email: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.authRepository.findUserByEmail(dto.email);

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);

    const user = await this.authRepository.createUser({
      name: dto.fullName,
      email: dto.email,
      password: passwordHash,
    });

    return {
      user: this.toPublicUser(user),
    };
  }

  async login(dto: LoginDto) {
    const existingUser = await this.authRepository.findUserByEmail(dto.email);

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

  private async createAccessToken(payload: { userUuid: string; role: Role }) {
    return this.jwtService.signAsync(
      {
        sub: payload.userUuid,
        role: payload.role,
        type: 'access',
      },
      {
        secret: this.configService.getOrThrow<string>('api.accessToken'),
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
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
