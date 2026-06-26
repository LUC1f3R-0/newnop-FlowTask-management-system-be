import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

import {
  TaskPriority,
  TaskStatus,
} from '../../../../generated/prisma/enums.js';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty({ message: 'Title is required' })
  @MaxLength(255, { message: 'Title must not exceed 255 characters' })
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(TaskPriority, {
    message: 'Priority must be LOW, MEDIUM, or HIGH',
  })
  priority?: TaskPriority;

  @IsOptional()
  @IsEnum(TaskStatus, {
    message: 'Status must be TODO, IN_PROGRESS, or COMPLETED',
  })
  status?: TaskStatus;

  @IsOptional()
  @IsDateString({}, { message: 'Due date must be a valid date string' })
  dueDate?: string;

  @IsOptional()
  @IsUUID('4', { message: 'Assigned user id must be a valid UUID' })
  assignedToId?: string;
}
