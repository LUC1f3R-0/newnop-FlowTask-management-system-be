import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UsersRepository } from './users.repository.js';
import { Role } from '../../../generated/prisma/enums.js';

type AuthUser = {
  userUuid: string;
  role: Role;
};

@Injectable()
class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async findMe(userUuid: string) {
    const user = await this.usersRepository.findByUuid(userUuid);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      user,
    };
  }

  async findAllUsers(authUser: AuthUser, search?: string) {
    if (authUser.role !== Role.ADMIN) {
      throw new ForbiddenException('Only admins can view all users');
    }

    const users = await this.usersRepository.findAllUsers({
      search,
    });

    return {
      users,
    };
  }

  async findAssignableUsers(params: {
    search?: string;
    currentUserUuid?: string;
  }) {
    const users = await this.usersRepository.findAssignableUsers(params);

    return {
      users,
    };
  }
}

export { UsersService };
