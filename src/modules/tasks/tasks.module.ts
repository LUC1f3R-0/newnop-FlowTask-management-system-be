import { Module } from '@nestjs/common';
import { TasksController } from './tasks.controller.js';
import { JwtModule } from '@nestjs/jwt';
import { DatabaseModule } from '../../infastructure/database/database.module.js';
import { TasksService } from './tasks.service.js';
import { TasksRepository } from './tasks.repository.js';

@Module({
  imports: [DatabaseModule, JwtModule.register({})],
  controllers: [TasksController],
  providers: [TasksService, TasksRepository],
  exports: [TasksService],
})
export class TaskModule {}
