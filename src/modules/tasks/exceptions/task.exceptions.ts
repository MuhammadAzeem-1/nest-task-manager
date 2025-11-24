import { HttpException, HttpStatus } from '@nestjs/common';

export class TaskNotFoundException extends HttpException {
  constructor(id: string) {
    super(`Task with ID '${id}' not found`, HttpStatus.NOT_FOUND);
  }
}

export class TaskValidationException extends HttpException {
  constructor(message: string) {
    super(`Task validation failed: ${message}`, HttpStatus.BAD_REQUEST);
  }
}

export class TaskCreationException extends HttpException {
  constructor(message?: string) {
    super(
      `Failed to create task${message ? `: ${message}` : ''}`,
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class TaskUpdateException extends HttpException {
  constructor(id: string, message?: string) {
    super(
      `Failed to update task with ID '${id}'${message ? `: ${message}` : ''}`,
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class TaskDeletionException extends HttpException {
  constructor(id: string, message?: string) {
    super(
      `Failed to delete task with ID '${id}'${message ? `: ${message}` : ''}`,
      HttpStatus.BAD_REQUEST,
    );
  }
}
