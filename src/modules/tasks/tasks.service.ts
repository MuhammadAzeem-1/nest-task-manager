import { Injectable } from '@nestjs/common';

@Injectable()
export class TasksService {
  tasks: string = 'Hello World!';
  test: string = 'test';

  getTasks(data): string {
    return this.tasks + data;
  }
}
