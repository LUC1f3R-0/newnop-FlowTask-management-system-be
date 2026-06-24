import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { PrismaService } from './prisma.service.js';

@Injectable()
class DatabaseStatusService implements OnApplicationBootstrap {
  private readonly logger = new Logger(DatabaseStatusService.name);

  constructor(private readonly prisma: PrismaService) {}

  async onApplicationBootstrap() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      this.logger.log('Database connection success');
    } catch (error) {
      this.logger.error('Database health check failed', error);
    }
  }
}
export { DatabaseStatusService };
