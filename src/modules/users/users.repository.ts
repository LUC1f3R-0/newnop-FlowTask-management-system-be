// src/modules/users/users.repository.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infastructure/database/prisma.service.js';

@Injectable()
class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByUuid(uuid: string) {
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

export { UsersRepository };
