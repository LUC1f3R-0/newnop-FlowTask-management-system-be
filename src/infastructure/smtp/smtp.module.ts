import { Module } from '@nestjs/common';
import { SmtpService } from './smtp.service.js';
import { SmtpStatusService } from './smtp-status.service.js';

@Module({
  providers: [SmtpService, SmtpStatusService],
  exports: [SmtpService, SmtpStatusService],
})
export class SmtpModule {}
