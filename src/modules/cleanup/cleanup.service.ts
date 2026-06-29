import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../infastructure/database/prisma.service.js';

@Injectable()
export class CleanupService {
  private readonly logger = new Logger(CleanupService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Cron job 1:
   * Permanently delete users who registered but did not verify their email
   * for more than one month.
   *
   * Runs every day at midnight.
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async deleteOldUnverifiedUsers() {
    const cutoffDate = this.getOneMonthAgo();

    const users = await this.prisma.users.findMany({
      where: {
        isEmailVerified: false,
        createdAt: {
          lte: cutoffDate,
        },
      },
      select: {
        id: true,
        uuid: true,
        email: true,
      },
    });

    if (users.length === 0) {
      this.logger.log('No old unverified users to permanently delete');
      return;
    }

    const userIds = users.map((user) => user.id);

    await this.prisma.$transaction(async (tx) => {
      /**
       * Sessions are deleted first because they belong to users.
       */
      await tx.session.deleteMany({
        where: {
          userId: {
            in: userIds,
          },
        },
      });

      /**
       * If any old unverified user was assigned to a task, remove assignment.
       * assignedToId is nullable, so this is safe.
       */
      await tx.task.updateMany({
        where: {
          assignedToId: {
            in: userIds,
          },
        },
        data: {
          assignedToId: null,
        },
      });

      /**
       * createdById is required, so if an old unverified user somehow created
       * tasks, remove those tasks before deleting the user.
       */
      await tx.task.deleteMany({
        where: {
          createdById: {
            in: userIds,
          },
        },
      });

      await tx.users.deleteMany({
        where: {
          id: {
            in: userIds,
          },
        },
      });
    });

    this.logger.warn(
      `Permanently deleted ${users.length} unverified user(s) older than one month`,
    );
  }

  /**
   * Cron job 2:
   * Permanently delete tasks that have been soft deleted for more than one month.
   * Uses the deletedAt date that was inserted when the task was soft deleted.
   *
   * Runs every day at 12:30 AM.
   */
  @Cron('30 0 * * *')
  async deleteOldSoftDeletedTasks() {
    const cutoffDate = this.getOneMonthAgo();

    const result = await this.prisma.task.deleteMany({
      where: {
        deletedAt: {
          not: null,
          lte: cutoffDate,
        },
      },
    });

    if (result.count === 0) {
      this.logger.log('No old soft-deleted tasks to permanently delete');
      return;
    }

    this.logger.warn(
      `Permanently deleted ${result.count} soft-deleted task(s) older than one month`,
    );
  }

  private getOneMonthAgo() {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date;
  }
}
