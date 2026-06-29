import { BadRequestException, Injectable } from '@nestjs/common';
import {
  Role,
  TaskPriority,
  TaskStatus,
} from '../../../generated/prisma/enums.js';
import { TasksRepository } from './tasks.repository.js';
import { CreateTaskDto, UpdateTaskDto } from './dto/tasks.dto.js';

type AuthUser = {
  userUuid: string;
  role: Role;
};

@Injectable()
class TasksService {
  constructor(private readonly tasksRepository: TasksRepository) {}

  async findAllForLoggedInUser(
    authUser: AuthUser,
    query: {
      page?: string;
      limit?: string;
      status?: string;
      priority?: string;
    },
  ) {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 10);

    const status = this.parseTaskStatus(query.status);
    const priority = this.parseTaskPriority(query.priority);

    if (authUser.role === Role.ADMIN) {
      return this.tasksRepository.findAll({
        page,
        limit,
        status,
        priority,
      });
    }

    const user = await this.tasksRepository.findUserIdByUuid(authUser.userUuid);

    return this.tasksRepository.findVisibleToUser({
      userId: user.id,
      page,
      limit,
      status,
      priority,
    });
  }

  private parseTaskStatus(status?: string) {
    if (!status) return undefined;

    if (!Object.values(TaskStatus).includes(status as TaskStatus)) {
      throw new BadRequestException(
        'Invalid status. Status must be TODO, IN_PROGRESS, or COMPLETED',
      );
    }

    return status as TaskStatus;
  }

  private parseTaskPriority(priority?: string) {
    if (!priority) return undefined;

    if (!Object.values(TaskPriority).includes(priority as TaskPriority)) {
      throw new BadRequestException(
        'Invalid priority. Priority must be LOW, MEDIUM, or HIGH',
      );
    }

    return priority as TaskPriority;
  }

  async createTask(authUser: AuthUser, dto: CreateTaskDto) {
    const createdBy = await this.tasksRepository.findUserIdByUuid(
      authUser.userUuid,
    );

    const assignedTo = dto.assignedToId
      ? await this.tasksRepository.findUserIdByUuid(dto.assignedToId)
      : null;

    const task = await this.tasksRepository.createTask({
      title: dto.title,
      description: dto.description,
      priority: dto.priority,
      status: dto.status,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
      createdById: createdBy.id,
      assignedToId: assignedTo?.id ?? null,
    });

    return {
      task,
    };
  }

  async updateTask(authUser: AuthUser, taskUuid: string, dto: UpdateTaskDto) {
    const loggedUser = await this.tasksRepository.findUserIdByUuid(
      authUser.userUuid,
    );

    if (authUser.role === Role.ADMIN) {
      await this.tasksRepository.findActiveTaskByUuid(taskUuid);
    } else {
      await this.tasksRepository.findVisibleTaskByUuid({
        uuid: taskUuid,
        userId: loggedUser.id,
      });
    }

    const assignedTo = dto.assignedToId
      ? await this.tasksRepository.findUserIdByUuid(dto.assignedToId)
      : undefined;

    const task = await this.tasksRepository.updateTaskByUuid(taskUuid, {
      title: dto.title,
      description: dto.description,
      priority: dto.priority,
      status: dto.status,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      assignedToId: assignedTo ? assignedTo.id : undefined,
    });

    return {
      task,
    };
  }

  async deleteTask(authUser: AuthUser, taskUuid: string) {
    const loggedUser = await this.tasksRepository.findUserIdByUuid(
      authUser.userUuid,
    );

    if (authUser.role === Role.ADMIN) {
      await this.tasksRepository.findActiveTaskByUuid(taskUuid);
    } else {
      await this.tasksRepository.findVisibleTaskByUuid({
        uuid: taskUuid,
        userId: loggedUser.id,
      });
    }

    const task = await this.tasksRepository.softDeleteTaskByUuid(taskUuid);

    return {
      task,
    };
  }

  async selectTask() {}

  async assignTask() {}

  async showUsers() {}
}

export { TasksService };
