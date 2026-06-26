import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infastructure/database/prisma.service.js';
import { TaskPriority, TaskStatus } from '../../../generated/prisma/enums.js';

type CreateTaskData = {
  title: string;
  description?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  dueDate?: Date | null;
  createdById: bigint;
  assignedToId?: bigint | null;
};

@Injectable()
class TasksRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findUserIdByUuid(uuid: string) {
    const user = await this.prisma.users.findUnique({
      where: { uuid },
      select: {
        id: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async createTask(data: CreateTaskData) {
    const task = await this.prisma.task.create({
      data: {
        title: data.title,
        description: data.description ?? null,
        priority: data.priority ?? TaskPriority.MEDIUM,
        status: data.status ?? TaskStatus.TODO,
        dueDate: data.dueDate ?? null,
        createdById: data.createdById,
        assignedToId: data.assignedToId ?? null,
      },
      select: this.taskSelect(),
    });

    return this.toTaskResponse(task);
  }

  async findAll(params: { page: number; limit: number }) {
    const skip = (params.page - 1) * params.limit;

    const where = {
      deletedAt: null,
    };

    const [tasks, total] = await Promise.all([
      this.prisma.task.findMany({
        where,
        skip,
        take: params.limit,
        orderBy: {
          createdAt: 'desc',
        },
        select: this.taskSelect(),
      }),

      this.prisma.task.count({
        where,
      }),
    ]);

    return {
      tasks: tasks.map((task) => this.toTaskResponse(task)),
      meta: {
        page: params.page,
        limit: params.limit,
        total,
        totalPages: Math.ceil(total / params.limit),
      },
    };
  }

  async findVisibleToUser(params: {
    userId: bigint;
    page: number;
    limit: number;
  }) {
    const skip = (params.page - 1) * params.limit;

    const where = {
      deletedAt: null,
      OR: [
        {
          createdById: params.userId,
        },
        {
          assignedToId: params.userId,
        },
      ],
    };

    const [tasks, total] = await Promise.all([
      this.prisma.task.findMany({
        where,
        skip,
        take: params.limit,
        orderBy: {
          createdAt: 'desc',
        },
        select: this.taskSelect(),
      }),

      this.prisma.task.count({
        where,
      }),
    ]);

    return {
      tasks: tasks.map((task) => this.toTaskResponse(task)),
      meta: {
        page: params.page,
        limit: params.limit,
        total,
        totalPages: Math.ceil(total / params.limit),
      },
    };
  }

  private taskSelect() {
    return {
      uuid: true,
      title: true,
      description: true,
      priority: true,
      status: true,
      dueDate: true,
      createdAt: true,
      updatedAt: true,
      createdBy: {
        select: {
          uuid: true,
          name: true,
          email: true,
        },
      },
      assignedTo: {
        select: {
          uuid: true,
          name: true,
          email: true,
        },
      },
    };
  }

  private toTaskResponse(task: any) {
    return {
      id: task.uuid,
      title: task.title,
      description: task.description,
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate,
      createdBy: {
        id: task.createdBy.uuid,
        name: task.createdBy.name,
        email: task.createdBy.email,
      },
      assignedTo: task.assignedTo
        ? {
            id: task.assignedTo.uuid,
            name: task.assignedTo.name,
            email: task.assignedTo.email,
          }
        : null,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    };
  }
}

export { TasksRepository };
