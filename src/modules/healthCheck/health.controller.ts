import { Controller, Get } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator.js';
import { DatabaseStatusService } from '../../infastructure/database/database-status.service.js';
import { SmtpStatusService } from '../../infastructure/smtp/smtp-status.service.js';

@Controller('health')
@Public()
export class HealthController {
  constructor(
    private readonly databaseStatusService: DatabaseStatusService,
    private readonly smtpStatusService: SmtpStatusService,
  ) {}

  @Get()
  async healthCheck() {
    const [database, smtp] = await Promise.all([
      this.databaseStatusService.checkStatus(),
      this.smtpStatusService.checkStatus(),
    ]);

    const isHealthy = database.status === 'ok' && smtp.status === 'ok';

    return {
      success: isHealthy,
      message: isHealthy ? 'Service is healthy' : 'Service is unhealthy',
      data: {
        service: 'flowtask-api',
        status: isHealthy ? 'ok' : 'error',
        checks: {
          database,
          smtp,
        },
        timestamp: new Date().toISOString(),
      },
      meta: null,
      errors: isHealthy ? null : ['One or more health checks failed'],
    };
  }
}