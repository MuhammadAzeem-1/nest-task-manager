import {
  Body,
  Controller,
  Get,
  HttpException,
  Param,
  Post,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { Task } from './task.interface';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get('/')
  getAllTasks(): Task[] {
    return this.tasksService.getAllTasks();
  }

  @Get('/:id')
  getTaskById(@Param('id') id: string): Task | undefined {
    const task = this.tasksService.getTaskById(id);

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
  // use Body() decorator to extract the body of the request
  createTask(@Body() task: Task): Task {
    const success = this.tasksService.createTask(task);
    if (!success) {
      throw new HttpException(
        {
          status: 500,
          error: 'Task creation failed',
        },
        500,
      );
    }
    return task;
  }
}
