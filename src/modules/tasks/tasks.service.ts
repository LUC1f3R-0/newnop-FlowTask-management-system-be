import { Injectable } from '@nestjs/common';
import { Role } from '../../../generated/prisma/enums.js';
import { TasksRepository } from './tasks.repository.js';
import { CreateTaskDto } from './dto/tasks.dto.js';

type AuthUser = {
  userUuid: string;
  role: Role;
};

@Injectable()
class TasksService {
  constructor(private readonly tasksRepository: TasksRepository) {}

  async findAllForLoggedInUser(authUser: AuthUser, query: any) {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 10);

    if (authUser.role === Role.ADMIN) {
      return this.tasksRepository.findAll({
        page,
        limit,
      });
    }

    const user = await this.tasksRepository.findUserIdByUuid(authUser.userUuid);

    return this.tasksRepository.findVisibleToUser({
      userId: user.id,
      page,
      limit,
    });
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

  async updateTask() {} /*admin & user*/

  async selectTask() {} /*admin & user*/

  async assignTask() {} /*admin & user*/

  async showUsers() {} /*admin & user*/

  async deleteTask() {} /*admin & user*/
}

export { TasksService };
