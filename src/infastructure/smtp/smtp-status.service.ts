import {
  Injectable,
  Logger,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { SmtpService } from './smtp.service.js';

@Injectable()
export class SmtpStatusService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SmtpStatusService.name);

  constructor(private readonly smtpService: SmtpService) {}

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
      await this.smtpService.verifyConnection();

      return {
        status: 'ok',
        message: 'SMTP connection success',
      };
    } catch (error) {
      this.logger.error('SMTP health check error', error);

      return {
        status: 'error',
        message: 'SMTP connection failed',
      };
    }
  }
}