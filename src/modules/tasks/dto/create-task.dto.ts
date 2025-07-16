import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateTaskDto {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @IsString()
  @IsNotEmpty()
  title: string;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @IsString()
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @IsOptional()
  description: string;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @IsString()
  status: 'COMPLETED' | 'IN_PROGRESS' | 'CANCELLED';
  // Add other properties as needed
}

export class RetrunCreateTaskDto {
  success: boolean;
  title: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'CANCELLED';
  // Add other properties as needed
}

export type PublicTaskDto = {
  id: string;
  title: string;
  description?: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'CANCELLED';
  createdAt: Date;
  updatedAt: Date;
};
