import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import type { Role } from '../../../generated/prisma/enums.js';

export type AuthenticatedRequest = Request & {
  auth: {
    userUuid: string;
    role: Role;
  };
};

type AccessTokenPayload = {
  sub: string;
  role: Role;
  type: 'access';
};

@Injectable()
export class AccessTokenCookieGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    const accessToken = request.cookies?.accessToken;

    if (!accessToken) {
      throw new UnauthorizedException('Access token is missing');
    }

    const payload = await this.jwtService.verifyAsync<AccessTokenPayload>(
      accessToken,
      {
        secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
      },
    );

    if (payload.type !== 'access') {
      throw new UnauthorizedException('Invalid token type');
    }

    request.auth = {
      userUuid: payload.sub,
      role: payload.role,
    };

    return true;
  }
}
