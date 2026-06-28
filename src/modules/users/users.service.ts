import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersRepository } from './users.repository.js';

type AuthUser = {
  userUuid: string;
  role: string;
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
