import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infastructure/database/prisma.service.js';

type CreateUserData = {
  name: string;
  email: string;
  password: string;
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
        uuid: true,
        name: true,
        email: true,
        password: true,
        role: true,
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
      },
      select: {
        uuid: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
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
        createdAt: true,
        updatedAt: true,
      },
    });
  }
}
