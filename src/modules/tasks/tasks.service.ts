import {
  Injectable,
  NotFoundException,
  Logger,
  ForbiddenException,
} from '@nestjs/common';
import { CreateTaskDto, PublicTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { PrismaService } from '../prisma/prisma.service';
import { ApiResponse } from 'src/config/types';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { PrismaException } from 'src/common/exceptions/prisma.exception';
import { TaskStatus } from './enums/task-status.enum';
import { UserRole } from '../users/enums/user-role.enum';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(private prisma: PrismaService) {}

  async getAllTasks(user: any): Promise<ApiResponse<PublicTaskDto[]>> {
    try {
      // Admin can see all tasks, regular users only their own
      const whereClause =
        user.role === UserRole.ADMIN ? {} : { userId: user.id };

      const tasks = await this.prisma.task.findMany({
        where: whereClause,
        select: {
          id: true,
          title: true,
          description: true,
          status: true,
          userId: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      this.logger.log(
        `User ${user.email} retrieved ${tasks.length} tasks (role: ${user.role})`,
      );

      return {
        success: true,
        data: tasks as PublicTaskDto[],
        error: null,
        message:
          tasks.length === 0
            ? 'No tasks found'
            : `Retrieved ${tasks.length} tasks`,
      };
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        throw new PrismaException(error);
      }
      this.logger.error(`Error fetching tasks: ${error}`, error);
      throw error;
    }
  }

  async getTaskById(
    id: string,
    user: any,
  ): Promise<ApiResponse<PublicTaskDto>> {
    try {
      const task = await this.prisma.task.findUnique({
        where: { id },
        select: {
          id: true,
          title: true,
          description: true,
          status: true,
          userId: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!task) {
        this.logger.warn(`Task with ID ${id} not found`);
        throw new NotFoundException(`Task with ID ${id} not found`);
      }

      // Check if user has permission to view this task
      if (user.role !== UserRole.ADMIN && task.userId !== user.id) {
        this.logger.warn(
          `User ${user.email} attempted to access task ${id} without permission`,
        );
        throw new ForbiddenException(
          'You do not have permission to view this task',
        );
      }

      this.logger.log(`User ${user.email} retrieved task with ID: ${id}`);

      return {
        success: true,
        data: task as PublicTaskDto,
        error: null,
        message: 'Task retrieved successfully',
      };
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        throw new PrismaException(error);
      }
      this.logger.error(`Error fetching task by ID: ${error}`, error);
      throw error;
    }
  }

  async createTask(
    task: CreateTaskDto,
    user: any,
  ): Promise<ApiResponse<PublicTaskDto>> {
    try {
      const newTask = await this.prisma.task.create({
        data: {
          title: task.title,
          description: task.description || '',
          status: task.status || TaskStatus.IN_PROGRESS,
          userId: user.id, // Link task to the logged-in user
        },
        select: {
          id: true,
          title: true,
          description: true,
          status: true,
          userId: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      this.logger.log(`User ${user.email} created task with ID: ${newTask.id}`);

      return {
        success: true,
        data: newTask as PublicTaskDto,
        error: null,
        message: 'Task created successfully',
      };
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        throw new PrismaException(error);
      }
      this.logger.error(`Error creating task: ${error}`, error);
      throw error;
    }
  }

  async updateTask(
    id: string,
    updatedTask: UpdateTaskDto,
    user: any,
  ): Promise<ApiResponse<PublicTaskDto>> {
    try {
      // Check if task exists
      const existingTask = await this.prisma.task.findUnique({
        where: { id },
      });

      if (!existingTask) {
        this.logger.warn(`Task with ID ${id} not found`);
        throw new NotFoundException(`Task with ID ${id} not found`);
      }

      // Check if user has permission to update this task
      if (user.role !== UserRole.ADMIN && existingTask.userId !== user.id) {
        this.logger.warn(
          `User ${user.email} attempted to update task ${id} without permission`,
        );
        throw new ForbiddenException(
          'You do not have permission to update this task',
        );
      }

      // Only update fields that are provided
      const dataToUpdate: Partial<UpdateTaskDto> = {};
      if (updatedTask.title !== undefined)
        dataToUpdate.title = updatedTask.title;
      if (updatedTask.description !== undefined)
        dataToUpdate.description = updatedTask.description;
      if (updatedTask.status !== undefined)
        dataToUpdate.status = updatedTask.status;

      const task = await this.prisma.task.update({
        where: { id },
        data: dataToUpdate,
        select: {
          id: true,
          title: true,
          description: true,
          status: true,
          userId: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      this.logger.log(`User ${user.email} updated task with ID ${id}`);

      return {
        success: true,
        data: task as PublicTaskDto,
        error: null,
        message: 'Task updated successfully',
      };
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        throw new PrismaException(error);
      }

      this.logger.error(`Error updating task: ${error}`, error);
      throw error;
    }
  }

  async deleteTask(id: string, user: any): Promise<ApiResponse<PublicTaskDto>> {
    try {
      // Check if task exists
      const existingTask = await this.prisma.task.findUnique({
        where: { id },
      });

      if (!existingTask) {
        this.logger.warn(`Task with ID ${id} not found`);
        throw new NotFoundException(`Task with ID ${id} not found`);
      }

      // Check if user has permission to delete this task
      if (user.role !== UserRole.ADMIN && existingTask.userId !== user.id) {
        this.logger.warn(
          `User ${user.email} attempted to delete task ${id} without permission`,
        );
        throw new ForbiddenException(
          'You do not have permission to delete this task',
        );
      }

      const data = await this.prisma.task.delete({
        where: { id },
        select: {
          id: true,
          title: true,
          description: true,
          status: true,
          userId: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      this.logger.log(`User ${user.email} deleted task with ID ${id}`);

      return {
        success: true,
        data: data as PublicTaskDto,
        error: null,
        message: 'Task deleted successfully',
      };
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        throw new PrismaException(error);
      }
      this.logger.error(`Error deleting task with ID ${id}: ${error}`, error);
      throw error;
    }
  }
}
