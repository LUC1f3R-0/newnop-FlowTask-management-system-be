import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { PrismaService } from './prisma.service.js';

@Injectable()
export class DatabaseStatusService implements OnApplicationBootstrap {
  private readonly logger = new Logger(DatabaseStatusService.name);

  constructor(private readonly prisma: PrismaService) {}

  async onApplicationBootstrap() {
    const result = await this.checkStatus();

    if (result.status === 'ok') {
      this.logger.log(result.message);
      return;
    }

    this.logger.error(result.message);
  }

  async checkStatus() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;

      return {
        status: 'ok' as const,
        message: 'Database connection success',
      };
    } catch (error) {
      this.logger.error('Database health check failed', error);

      return {
        status: 'error' as const,
        message: 'Database connection failed',
      };
    }
  }
}
