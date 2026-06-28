import { Module } from '@nestjs/common';
import { HealthController } from './health.controller.js';
import { DatabaseModule } from '../../infastructure/database/database.module.js';

@Module({
  imports: [DatabaseModule],
  controllers: [HealthController],
})
export class HealthModule {}
