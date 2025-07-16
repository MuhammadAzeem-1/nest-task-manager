import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { CreateTaskDto, PublicTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { PrismaService } from '../prisma/prisma.service';
import { ApiResponse } from 'src/config/types';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(private prisma: PrismaService) {}

  async getAllTasks(): Promise<ApiResponse<PublicTaskDto[]>> {
    const tasks = await this.prisma.task.findMany({
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return {
      success: tasks.length > 0,
      data: tasks,
      error: tasks.length === 0 ? 'No tasks found' : null,
    };
  }

  async getTaskById(id: string): Promise<ApiResponse<PublicTaskDto>> {
    const task = await this.prisma.task.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!task) {
      this.logger.warn(`Task with ID ${id} not found`);
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    return {
      success: true,
      data: task,
      error: null,
    };
  }

  async createTask(task: CreateTaskDto): Promise<ApiResponse<PublicTaskDto>> {
    try {
      const newTask = await this.prisma.task.create({
        data: {
          title: task.title,
          description: task.description,
          status: task.status,
        },
        select: {
          id: true,
          title: true,
          description: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      return {
        success: true,
        data: newTask,
        error: null,
      };
    } catch (error) {
      this.logger.error(`Error creating task: ${error}`, error);
      throw new BadRequestException('Failed to create task');
    }
  }

  async updateTask(
    id: string,
    updatedTask: UpdateTaskDto,
  ): Promise<ApiResponse<PublicTaskDto>> {
    try {
      const task = await this.prisma.task.update({
        where: { id },
        data: {
          title: updatedTask.title,
          description: updatedTask.description,
          status: updatedTask.status,
        },
        select: {
          id: true,
          title: true,
          description: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      return {
        success: true,
        data: task,
        error: null,
      };
    } catch (error) {
      if (error) {
        // Prisma error code for record not found
        this.logger.warn(`Task with ID ${id} not found`);
        throw new NotFoundException(`Task with ID ${id} not found`);
      }
      this.logger.error(`Error updating task: ${error}`, error);
      throw new BadRequestException('Failed to update task');
    }
  }

  async deleteTask(id: string): Promise<ApiResponse<PublicTaskDto>> {
    try {
      const data = await this.prisma.task.delete({
        where: { id },
      });

      return {
        success: true,
        data: data,
        error: null,
      };
    } catch (error) {
      this.logger.error(`Error deleting task with ID ${id}: ${error}`, error);
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
  }
}
