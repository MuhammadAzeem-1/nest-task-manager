import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto, PublicTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { ApiResponse } from 'src/config/types';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getAllTasks(
    @CurrentUser() user: any,
  ): Promise<ApiResponse<PublicTaskDto[]>> {
    return await this.tasksService.getAllTasks(user);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getTaskById(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ): Promise<ApiResponse<PublicTaskDto>> {
    return await this.tasksService.getTaskById(id, user);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createTask(
    @Body() createTaskDto: CreateTaskDto,
    @CurrentUser() user: any,
  ): Promise<ApiResponse<PublicTaskDto>> {
    return await this.tasksService.createTask(createTaskDto, user);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async updateTask(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @CurrentUser() user: any,
  ): Promise<ApiResponse<PublicTaskDto>> {
    return await this.tasksService.updateTask(id, updateTaskDto, user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deleteTask(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ): Promise<ApiResponse<PublicTaskDto>> {
    return await this.tasksService.deleteTask(id, user);
  }
}
