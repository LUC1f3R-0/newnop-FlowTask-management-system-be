import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './prisma.service.js';
import { DatabaseStatusService } from './database-status.service.js';

@Module({
  imports: [ConfigModule],
  providers: [PrismaService, DatabaseStatusService],
  exports: [PrismaService, DatabaseStatusService],
})
export class DatabaseModule {}