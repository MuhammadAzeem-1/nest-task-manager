import { IsOptional, IsString } from 'class-validator';

export class CreateTaskDto {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @IsString()
  id: string;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @IsString()
  title: string;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @IsString()
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @IsOptional()
  description: string;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @IsString()
  status: 'DONE' | 'IN_PROGRESS' | 'OPEN';
  // Add other properties as needed
}

export class RetrunCreateTaskDto {
  title: string;
  status: 'DONE' | 'IN_PROGRESS' | 'OPEN';
  // Add other properties as needed
}
