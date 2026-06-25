import * as bcrypt from 'bcrypt';
import { LoginDto, RegisterDto } from './dto/auth.dto.js';
import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthRepository } from './auth.repository.js';
import { Role } from '../../../generated/prisma/enums.js';

const SALT_ROUNDS = 12;

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
  constructor(private readonly authRepository: AuthRepository) {}

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

    return {
      user: this.toPublicUser(existingUser),
    };
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
