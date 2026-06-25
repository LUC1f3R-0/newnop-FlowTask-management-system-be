import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service.js';
import { ResponseMessage } from '../../common/decorators/response-message.decorator.js';
import { AccessTokenCookieGuard } from '../../common/guards/access-token-cookie.guard.js';
import type { AuthenticatedRequest } from '../../common/guards/access-token-cookie.guard.js';

@Controller('users')
class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @UseGuards(AccessTokenCookieGuard)
  @ResponseMessage('User retrieved successfully')
  getMe(@Req() request: AuthenticatedRequest) {
    return this.usersService.findMe(request.auth.userUuid);
  }
}

export { UsersController };
