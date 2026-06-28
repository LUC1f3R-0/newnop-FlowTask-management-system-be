import { Injectable, Logger } from '@nestjs/common';
import { SmtpService } from './smtp.service.js';

@Injectable()
export class SmtpStatusService {
  private readonly logger = new Logger(SmtpStatusService.name);

  constructor(private readonly smtpService: SmtpService) {}

  async checkStatus() {
    try {
      await Promise.race([
        this.smtpService.verifyConnection(),
        new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error('SMTP health check timeout')),
            1500,
          ),
        ),
      ]);

      return {
        status: 'ok' as const,
        message: 'SMTP connection success',
      };
    } catch (error) {
      this.logger.error('SMTP health check error', error);

      return {
        status: 'error' as const,
        message: 'SMTP connection failed',
      };
    }
  }
}
