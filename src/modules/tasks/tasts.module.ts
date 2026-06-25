import { Module } from '@nestjs/common';
import { AuthController } from './tasts.controller.js';

@Module({
  controllers: [AuthController],
})
export class AuthModule {}
