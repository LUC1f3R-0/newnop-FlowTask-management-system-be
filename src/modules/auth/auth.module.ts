import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller.js';
import { DatabaseModule } from '../../infastructure/database/database.module.js';
import { AuthService } from './auth.service.js';
import { AuthRepository } from './auth.repository.js';

@Module({
  imports: [DatabaseModule],
  controllers: [AuthController],
  providers: [AuthService, AuthRepository],
  exports: [AuthService],
})
export class AuthModule {}
