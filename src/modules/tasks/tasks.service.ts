import { Injectable } from '@nestjs/common';
import { Task } from './task.interface';

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

  createTask(task: Task): boolean {
    console.log('task', task);

    this.tasks.push(task);
    return true;
  }
}
