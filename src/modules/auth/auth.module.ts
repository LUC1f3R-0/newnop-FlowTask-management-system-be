import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller.js';
import { DatabaseModule } from '../../infastructure/database/database.module.js';
import { AuthService } from './auth.service.js';
import { AuthRepository } from './auth.repository.js';
import { JwtModule } from '@nestjs/jwt';
import { SmtpService } from '../../infastructure/smtp/smtp.service.js';

@Module({
  imports: [DatabaseModule, JwtModule.register({})],
  controllers: [AuthController],
  providers: [AuthService, AuthRepository, SmtpService],
  exports: [AuthService],
})
export class AuthModule {}
