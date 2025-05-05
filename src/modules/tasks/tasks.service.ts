import { Injectable } from '@nestjs/common';
import { Task } from './task.interface';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  private tasks: Task[] = [
    {
      id: '1',
      title: 'Task 1',
      description: 'Description for Task 1',
      status: 'DONE',
    },
    {
      id: '2',
      title: 'Task 2',
      description: 'Description for Task 2',
      status: 'IN_PROGRESS',
    },
  ];

  getAllTasks(): Task[] {
    return this.tasks;
  }

  getTaskById(id: string): Task | undefined {
    return this.tasks.find((task) => task.id === id);
  }

  createTask(task: CreateTaskDto): boolean {
    this.tasks.push(task);
    return true;
  }

  updateTask(id: string, updatedTask: UpdateTaskDto): boolean {
    const taskIndex = this.tasks.findIndex((task) => task.id === id);
    if (taskIndex === -1) {
      return false; // Task not found
    }
    this.tasks[taskIndex] = { ...this.tasks[taskIndex], ...updatedTask };
    return true;
  }
}
