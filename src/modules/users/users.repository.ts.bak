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

  async findAssignableUsers(params: {
    search?: string;
    currentUserUuid?: string;
  }) {
    const search = params.search?.trim();

    const users = await this.prisma.users.findMany({
      where: {
        ...(params.currentUserUuid
          ? {
              uuid: {
                not: params.currentUserUuid,
              },
            }
          : {}),

        ...(search
          ? {
              OR: [
                {
                  name: {
                    contains: search,
                  },
                },
                {
                  email: {
                    contains: search,
                  },
                },
              ],
            }
          : {}),
      },
      select: {
        uuid: true,
        name: true,
        email: true,
        role: true,
      },
      orderBy: {
        name: 'asc',
      },
      take: 10,
    });

    return users.map((user) => ({
      id: user.uuid,
      name: user.name,
      email: user.email,
      role: user.role,
    }));
  }
}

export { UsersRepository };
