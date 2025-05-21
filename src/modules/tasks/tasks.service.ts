import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { PrismaService } from '../prisma/prisma.service';
//import { PrismaService } from 'src/modules/prisma/prisma.service';
import { Task as PrismaTask } from '@prisma/client';

@Injectable()
export class TasksService {
  // Inject PrismaService to interact with the database
  //constructor(private prisma: PrismaService) {}
  constructor(private prisma: PrismaService) {}

  async getAllTasks(): Promise<PrismaTask[]> {
    try {
      const tasks = await this.prisma.task.findMany();

      if (tasks.length === 0) {
        throw new NotFoundException('No tasks found.');
      }
      return tasks;
    } catch (error) {
      console.error('Error fetching tasks:', error);
      return [];
    }
  }

  async getTaskById(id: string): Promise<PrismaTask | null> {
    return await this.prisma.task.findUnique({
      where: { id },
    });
  }

  async createTask(task: CreateTaskDto): Promise<boolean> {
    try {
      await this.prisma.task.create({
        data: {
          title: task.title,
          description: task.description,
          status: task.status,
        },
      });

      return true;
    } catch (error) {
      console.error('Error creating task:', error);
      return false; // Return false if task creation fails
    }
  }

  async updateTask(id: string, updatedTask: UpdateTaskDto): Promise<boolean> {
    const taskIndex = await this.prisma.task.update({
      where: { id },
      data: {
        title: updatedTask.title,
        description: updatedTask.description,
        status: updatedTask.status,
      },
    });

    if (!taskIndex) {
      return false;
    }

    return true;
  }
}
