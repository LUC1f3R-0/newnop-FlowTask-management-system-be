import { Module } from '@nestjs/common';
import { HealthController } from './health.controller.js';
import { DatabaseModule } from '../../infastructure/database/database.module.js';
import { SmtpModule } from '../../infastructure/smtp/smtp.module.js';

@Module({
  imports: [DatabaseModule, SmtpModule],
  controllers: [HealthController],
})
export class HealthModule {}
