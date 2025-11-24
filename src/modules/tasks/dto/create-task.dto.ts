import { IsNotEmpty, IsOptional, IsString, IsEnum } from 'class-validator';
import { TaskStatus } from '../enums/task-status.enum';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;
}

export type PublicTaskDto = {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  userId?: string;
  createdAt: Date;
  updatedAt: Date;
};
