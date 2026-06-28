import { Controller, Get } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator.js';
import { DatabaseStatusService } from '../../infastructure/database/database-status.service.js';

@Controller('health')
@Public()
export class HealthController {
  constructor(private readonly databaseStatusService: DatabaseStatusService) {}

  @Get()
  async healthCheck() {
    const database = await this.databaseStatusService.checkStatus();

    const isHealthy = database.status === 'ok';

    return {
      success: isHealthy,
      message: isHealthy ? 'Service is healthy' : 'Service is unhealthy',
      data: {
        service: 'flowtask-api',
        status: isHealthy ? 'ok' : 'error',
        checks: {
          database,
          smtp: {
            status: 'skipped',
            message: 'SMTP health check skipped in Lambda VPC deployment',
          },
        },
        timestamp: new Date().toISOString(),
      },
      meta: null,
      errors: isHealthy ? null : ['Database health check failed'],
    };
  }
}
