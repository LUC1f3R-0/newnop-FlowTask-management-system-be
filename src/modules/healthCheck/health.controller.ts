import { Controller, Get } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator.js';

@Controller('health')
@Public()
export class HealthController {
  @Get()
  healthCheck() {
    return {
      success: true,
      message: 'Service is healthy',
      data: {
        service: 'flowtask-api',
        status: 'ok',
        timestamp: new Date().toISOString(),
      },
      meta: null,
      errors: null,
    };
  }
}