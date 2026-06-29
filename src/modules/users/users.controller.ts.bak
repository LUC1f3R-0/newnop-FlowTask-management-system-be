import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service.js';
import { ResponseMessage } from '../../common/decorators/response-message.decorator.js';
import { AccessTokenCookieGuard } from '../../common/guards/access-token-cookie.guard.js';
import type { AuthenticatedRequest } from '../../common/guards/access-token-cookie.guard.js';

@Controller('users')
@UseGuards(AccessTokenCookieGuard)
class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ResponseMessage('User retrieved successfully')
  getMe(@Req() request: AuthenticatedRequest) {
    return this.usersService.findMe(request.auth.userUuid);
  }

  @Get('assignable')
  @ResponseMessage('Assignable users fetched successfully')
  findAssignableUsers(
    @Req() request: AuthenticatedRequest,
    @Query('search') search?: string,
  ) {
    return this.usersService.findAssignableUsers({
      search,
      currentUserUuid: request.auth.userUuid,
    });
  }
}

export { UsersController };
