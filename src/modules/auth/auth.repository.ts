import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infastructure/database/prisma.service.js';

type CreateUserData = {
  name: string;
  email: string;
  password: string;
  otpHash: string;
  otpExpiresAt: Date;
};

type CreateSessionData = {
  uuid: string;
  userId: bigint;
  refreshTokenHash: string;
  expiresAt: Date;
};

@Injectable()
export class AuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  findUserByEmail(email: string) {
    return this.prisma.users.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
        uuid: true,
        name: true,
        email: true,
        password: true,
        role: true,
        OTPHashed: true,
        OTPExpiredAt: true,
        isEmailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  createUser(data: CreateUserData) {
    return this.prisma.users.create({
      data: {
        name: data.name,
        email: data.email,
        password: data.password,
        OTPHashed: data.otpHash,
        OTPExpiredAt: data.otpExpiresAt,
        isEmailVerified: false,
      },
      select: {
        uuid: true,
        name: true,
        email: true,
        role: true,
        isEmailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  updatePendingRegistration(data: {
    userId: bigint;
    name: string;
    password: string;
    otpHash: string;
    otpExpiresAt: Date;
  }) {
    return this.prisma.users.update({
      where: {
        id: data.userId,
      },
      data: {
        name: data.name,
        password: data.password,
        OTPHashed: data.otpHash,
        OTPExpiredAt: data.otpExpiresAt,
        isEmailVerified: false,
      },
      select: {
        uuid: true,
        name: true,
        email: true,
        role: true,
        isEmailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  updateEmailVerificationOtp(data: {
    userId: bigint;
    otpHash: string;
    otpExpiresAt: Date;
  }) {
    return this.prisma.users.update({
      where: {
        id: data.userId,
      },
      data: {
        OTPHashed: data.otpHash,
        OTPExpiredAt: data.otpExpiresAt,
      },
      select: {
        uuid: true,
        email: true,
      },
    });
  }

  markEmailAsVerified(userId: bigint) {
    return this.prisma.users.update({
      where: {
        id: userId,
      },
      data: {
        isEmailVerified: true,
        OTPHashed: null,
        OTPExpiredAt: null,
      },
      select: {
        uuid: true,
        name: true,
        email: true,
        role: true,
        isEmailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  revokeSessionByUuid(uuid: string) {
    return this.prisma.session.updateMany({
      where: {
        uuid,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });
  }

  revokeAllSessionsByUserId(userId: bigint) {
    return this.prisma.session.updateMany({
      where: {
        userId,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });
  }

  createSession(data: CreateSessionData) {
    return this.prisma.session.create({
      data: {
        uuid: data.uuid,
        userId: data.userId,
        refreshTokenHash: data.refreshTokenHash,
        expiresAt: data.expiresAt,
      },
      select: {
        uuid: true,
        expiresAt: true,
      },
    });
  }

  findUserIdByUuid(uuid: string) {
    return this.prisma.users.findUnique({
      where: {
        uuid,
      },
      select: {
        id: true,
        uuid: true,
      },
    });
  }

  deleteSessionByUuid(uuid: string) {
    return this.prisma.session.deleteMany({
      where: {
        uuid,
      },
    });
  }

  findActiveSessionByUuid(uuid: string) {
    return this.prisma.session.findFirst({
      where: {
        uuid,
        revokedAt: null,
      },
      select: {
        uuid: true,
        refreshTokenHash: true,
        expiresAt: true,
        user: {
          select: {
            id: true,
            uuid: true,
            name: true,
            email: true,
            role: true,
            isEmailVerified: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });
  }

  findUserByUuid(uuid: string) {
    return this.prisma.users.findUnique({
      where: {
        uuid,
      },
      select: {
        uuid: true,
        name: true,
        email: true,
        role: true,
        isEmailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }
}
