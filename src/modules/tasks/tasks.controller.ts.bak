import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { TasksService } from './tasks.service.js';
import { CreateTaskDto, UpdateTaskDto } from './dto/tasks.dto.js';
import {
  AccessTokenCookieGuard,
  type AuthenticatedRequest,
} from '../../common/guards/access-token-cookie.guard.js';
import { ResponseMessage } from '../../common/decorators/response-message.decorator.js';

@Controller('tasks')
@UseGuards(AccessTokenCookieGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  @ResponseMessage('Tasks fetched successfully')
  findAllForLoggedInUser(
    @Req() request: AuthenticatedRequest,
    @Query() query: { page?: string; limit?: string },
  ) {
    return this.tasksService.findAllForLoggedInUser(request.auth, query);
  }

  @Post('create')
  @ResponseMessage('Task created successfully')
  createTask(@Body() dto: CreateTaskDto, @Req() request: AuthenticatedRequest) {
    return this.tasksService.createTask(request.auth, dto);
  }

  @Patch(':id')
  @ResponseMessage('Task updated successfully')
  updateTask(
    @Param('id') taskUuid: string,
    @Body() dto: UpdateTaskDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.tasksService.updateTask(request.auth, taskUuid, dto);
  }

  @Delete(':id')
  @ResponseMessage('Task deleted successfully')
  deleteTask(
    @Param('id') taskUuid: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.tasksService.deleteTask(request.auth, taskUuid);
  }
}
