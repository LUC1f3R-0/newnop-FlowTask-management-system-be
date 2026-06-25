import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersRepository } from './users.repository.js';

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
}

export { UsersService };
