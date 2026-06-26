import { Injectable } from '@nestjs/common';
import { Role } from '../../../generated/prisma/enums.js';
import type { AuthenticatedRequest } from '../../common/guards/access-token-cookie.guard.js';

@Injectable()
export class DashboardService {
  getDashboardMessage(auth: AuthenticatedRequest['auth']) {
    if (auth.role === Role.ADMIN) {
      return {
        message: 'this is an admin',
        user: {
          id: auth.userUuid,
          role: auth.role,
        },
      };
    }

    return {
      message: 'this is a user',
      user: {
        id: auth.userUuid,
        role: auth.role,
      },
    };
  }
}
