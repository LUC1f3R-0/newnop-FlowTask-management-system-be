import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../infastructure/database/database.module.js';
import { CleanupService } from './cleanup.service.js';

@Module({
  imports: [DatabaseModule],
  providers: [CleanupService],
})
export class CleanupModule {}
