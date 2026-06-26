import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { TasksService } from './tasks.service.js';
import { CreateTaskDto } from './dto/tasks.dto.js';
import {
  AccessTokenCookieGuard,
  type AuthenticatedRequest,
} from '../../common/guards/access-token-cookie.guard.js';
import { ResponseMessage } from '../../common/decorators/response-message.decorator.js';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post('create')
  @UseGuards(AccessTokenCookieGuard)
  @ResponseMessage('Task created successfully')
  createTask(@Body() dto: CreateTaskDto, @Req() request: AuthenticatedRequest) {
    return this.tasksService.createTask(request.auth, dto);
  }
}
