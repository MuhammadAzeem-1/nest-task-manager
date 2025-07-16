import { IsOptional, IsString } from 'class-validator';

export class UpdateTaskDto {
  success: boolean;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
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
  status: 'COMPLETED' | 'IN_PROGRESS' | 'CANCELLED';
  // Add other properties as needed
}

export class RetrunUpdateTaskDto {
  title: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'CANCELLED';
}
