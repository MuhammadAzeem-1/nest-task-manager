export class ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: string | null;
  message?: string;
  token?: string;
}
