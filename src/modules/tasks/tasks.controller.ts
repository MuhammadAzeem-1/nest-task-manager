import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto, PublicTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { ApiResponse } from 'src/config/types';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  async getAllTasks(): Promise<ApiResponse<PublicTaskDto[]>> {
    return this.tasksService.getAllTasks();
  }

  @Get(':id')
  async getTaskById(
    @Param('id') id: string,
  ): Promise<ApiResponse<PublicTaskDto>> {
    return this.tasksService.getTaskById(id); // Service handles NotFoundException
  }

  @Post()
  async createTask(
    @Body() createTaskDto: CreateTaskDto,
  ): Promise<ApiResponse<PublicTaskDto>> {
    return this.tasksService.createTask(createTaskDto);
  }

  @Put(':id')
  async updateTask(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
  ): Promise<ApiResponse<PublicTaskDto>> {
    return this.tasksService.updateTask(id, updateTaskDto);
  }

  @Delete(':id')
  async deleteTask(
    @Param('id') id: string,
  ): Promise<ApiResponse<PublicTaskDto>> {
    return this.tasksService.deleteTask(id);
  }
}
