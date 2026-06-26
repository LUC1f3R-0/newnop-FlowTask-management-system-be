import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service.js';
import {
  AccessTokenCookieGuard,
  type AuthenticatedRequest,
} from '../../common/guards/access-token-cookie.guard.js';

@Controller('dashboard')
@UseGuards(AccessTokenCookieGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  getDashboard(@Req() request: AuthenticatedRequest) {
    return this.dashboardService.getDashboardMessage(request.auth);
  }
}
