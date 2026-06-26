import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller.js';
import { DashboardService } from './dashboard.service.js';
import { JwtModule } from '@nestjs/jwt';

@Module({
  controllers: [DashboardController],
  providers: [DashboardService],
  imports: [JwtModule.register({})],
})
export class DashboardModule {}
