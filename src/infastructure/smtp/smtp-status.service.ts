import { Injectable } from '@nestjs/common';
import { SmtpService } from './smtp.service.js';

@Injectable()
export class SmtpStatusService {
  constructor(private readonly smtpService: SmtpService) {}

  async checkStatus() {
    try {
      await this.smtpService.verifyConnection();

      return {
        status: 'ok',
        message: 'SMTP connection is working',
      };
    } catch {
      return {
        status: 'error',
        message: 'SMTP connection failed',
      };
    }
  }
}
