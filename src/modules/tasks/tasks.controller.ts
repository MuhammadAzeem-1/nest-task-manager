import {
  Body,
  Controller,
  Get,
  HttpException,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto, RetrunCreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task as PrismaTask } from '@prisma/client';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get('/')
  async getAllTasks(): Promise<PrismaTask[]> {
    return this.tasksService.getAllTasks();
  }

  @Get('/:id')
  async getTaskById(@Param('id') id: string): Promise<PrismaTask | undefined> {
    const task = await this.tasksService.getTaskById(id);

    if (!task) {
      throw new HttpException(
        {
          status: 404,
          error: 'Task not found',
        },
        404,
      );
    }

    return task;
  }

  // Add other endpoints as needed, e.g., createTask, updateTask, deleteTask, etc.
  @Post('/create')
  // use Body() decorator to extract the body of the request and validate it
  // use CreateTaskDto to validate the request body - Currently just Testing
  async createTask(
    @Body() CreateTaskDto: CreateTaskDto,
  ): Promise<RetrunCreateTaskDto> {
    const success = await this.tasksService.createTask(CreateTaskDto);
    if (!success) {
      throw new HttpException(
        {
          status: 500,
          error: 'Task creation failed',
        },
        500,
      );
    }
    return {
      success: success,
      title: CreateTaskDto.title,
      status: CreateTaskDto.status,
    };
  }

  @Put('/update/:id')
  async updateTasks(
    @Param('id') id: string,
    @Body() UpdateTaskDto: UpdateTaskDto,
  ): Promise<Partial<UpdateTaskDto>> {
    // Implement the update logic here
    // You can use the @Param() decorator to get the task ID from the URL
    // and the @Body() decorator to get the updated task data from the request body
    const success = await this.tasksService.updateTask(id, UpdateTaskDto);
    if (!success) {
      throw new HttpException(
        {
          status: 404,
          error: 'Task not found',
        },
        404,
      );
    }
    return {
      success: success,
      title: UpdateTaskDto.title,
      status: UpdateTaskDto.status,
    };
  }
}
