import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { CreateTaskDto, PublicTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskStatus } from './enums/task-status.enum';
import { UserRole } from '../users/enums/user-role.enum';

/**
 * Unit Tests for TasksService
 *
 * What is a Service Layer Test?
 * - Tests the business logic of the service
 * - Mocks external dependencies (like database/Prisma)
 * - Tests different scenarios: success, errors, edge cases
 * - Ensures the service handles data correctly and enforces business rules
 *
 * Why Mock PrismaService?
 * - We don't want to hit a real database in unit tests (slow, requires setup)
 * - We control what Prisma returns, making tests predictable
 * - Tests run faster and don't depend on database state
 */
describe('TasksService', () => {
  // Declare variables for service and mocked Prisma
  let service: TasksService;
  let prismaService: PrismaService;

  /**
   * beforeEach runs before each test
   * This ensures each test has a fresh mock setup
   */
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          // Provide a mock PrismaService
          provide: PrismaService,
          useValue: {
            // Mock all Prisma methods we use in TasksService
            // task.findMany() - used in getAllTasks
            task: {
              findMany: jest.fn(),
              // task.findUnique() - used in getTaskById, updateTask, deleteTask
              findUnique: jest.fn(),
              // task.create() - used in createTask
              create: jest.fn(),
              // task.update() - used in updateTask
              update: jest.fn(),
              // task.delete() - used in deleteTask
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    // Get instances from the testing module
    service = module.get<TasksService>(TasksService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  /**
   * Basic test to ensure service is properly instantiated
   */
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAllTasks', () => {
    it('should return all tasks for a regular user (only their own tasks)', async () => {
      // Arrange: Set up test data
      const mockUser = {
        id: 'user-123',
        email: 'user@example.com',
        role: UserRole.USER,
      };

      // Mock tasks that belong to this user
      const mockTasks = [
        {
          id: 'task-1',
          title: 'User Task 1',
          description: 'Description 1',
          status: TaskStatus.IN_PROGRESS,
          userId: 'user-123',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
        {
          id: 'task-2',
          title: 'User Task 2',
          description: 'Description 2',
          status: TaskStatus.COMPLETED,
          userId: 'user-123',
          createdAt: new Date('2024-01-02'),
          updatedAt: new Date('2024-01-02'),
        },
      ];

      /**
       * Mock Prisma's findMany to return our mock tasks
       * mockResolvedValue() makes the async function return a resolved promise
       * Store the spy so we can assert on it without unbound method issues
       */
      const findManySpy = jest
        .spyOn(prismaService.task, 'findMany')
        .mockResolvedValue(mockTasks as any);

      // Act: Call the service method
      const result = await service.getAllTasks(mockUser);

      // Assert: Verify the results

      // Check that Prisma was called with correct filter (only user's tasks)
      expect(findManySpy).toHaveBeenCalledWith({
        where: { userId: 'user-123' }, // Regular users only see their own tasks
        select: {
          id: true,
          title: true,
          description: true,
          status: true,
          userId: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: {
          createdAt: 'desc', // Should be ordered by creation date descending
        },
      });

      // Check the response structure
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockTasks);
      expect(result.data).toHaveLength(2);
      expect(result.message).toBe('Retrieved 2 tasks');
      expect(result.error).toBeNull();
    });

    it('should return all tasks for an admin user (all tasks)', async () => {
      // Arrange
      const mockAdmin = {
        id: 'admin-123',
        email: 'admin@example.com',
        role: UserRole.ADMIN,
      };

      const mockTasks = [
        {
          id: 'task-1',
          title: 'Task 1',
          description: 'Description 1',
          status: TaskStatus.IN_PROGRESS,
          userId: 'user-123',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
        {
          id: 'task-2',
          title: 'Task 2',
          description: 'Description 2',
          status: TaskStatus.COMPLETED,
          userId: 'user-456',
          createdAt: new Date('2024-01-02'),
          updatedAt: new Date('2024-01-02'),
        },
      ];

      const findManySpy = jest
        .spyOn(prismaService.task, 'findMany')
        .mockResolvedValue(mockTasks as any);

      // Act
      const result = await service.getAllTasks(mockAdmin);

      // Assert
      // Admin should see all tasks (empty where clause)
      expect(findManySpy).toHaveBeenCalledWith({
        where: {}, // Admin sees all tasks
        select: {
          id: true,
          title: true,
          description: true,
          status: true,
          userId: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockTasks);
    });

    it('should return empty array when no tasks found', async () => {
      // Arrange
      const mockUser = {
        id: 'user-123',
        email: 'user@example.com',
        role: UserRole.USER,
      };

      // Mock Prisma to return empty array
      jest.spyOn(prismaService.task, 'findMany').mockResolvedValue([]);

      // Act
      const result = await service.getAllTasks(mockUser);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
      expect(result.message).toBe('No tasks found');
    });
  });

  describe('getTaskById', () => {
    it('should return a task when user owns it', async () => {
      // Arrange
      const taskId = 'task-123';
      const mockUser = {
        id: 'user-123',
        email: 'user@example.com',
        role: UserRole.USER,
      };

      const mockTask = {
        id: taskId,
        title: 'Test Task',
        description: 'Test Description',
        status: TaskStatus.IN_PROGRESS,
        userId: 'user-123', // Same as mockUser.id
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const findUniqueSpy = jest
        .spyOn(prismaService.task, 'findUnique')
        .mockResolvedValue(mockTask as any);

      // Act
      const result = await service.getTaskById(taskId, mockUser);

      // Assert
      expect(findUniqueSpy).toHaveBeenCalledWith({
        where: { id: taskId },
        select: {
          id: true,
          title: true,
          description: true,
          status: true,
          userId: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockTask);
      expect(result.message).toBe('Task retrieved successfully');
    });

    it('should return a task when user is admin', async () => {
      // Arrange
      const taskId = 'task-123';
      const mockAdmin = {
        id: 'admin-123',
        email: 'admin@example.com',
        role: UserRole.ADMIN,
      };

      const mockTask = {
        id: taskId,
        title: 'Test Task',
        description: 'Test Description',
        status: TaskStatus.IN_PROGRESS,
        userId: 'user-456', // Different user, but admin can see it
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest
        .spyOn(prismaService.task, 'findUnique')
        .mockResolvedValue(mockTask as any);

      // Act
      const result = await service.getTaskById(taskId, mockAdmin);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockTask);
    });

    it('should throw NotFoundException when task does not exist', async () => {
      // Arrange
      const taskId = 'non-existent-task';
      const mockUser = {
        id: 'user-123',
        email: 'user@example.com',
        role: UserRole.USER,
      };

      // Mock Prisma to return null (task not found)
      jest.spyOn(prismaService.task, 'findUnique').mockResolvedValue(null);

      // Act & Assert
      // expect().rejects.toThrow() tests that an async function throws an error
      await expect(service.getTaskById(taskId, mockUser)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.getTaskById(taskId, mockUser)).rejects.toThrow(
        `Task with ID ${taskId} not found`,
      );
    });

    it('should throw ForbiddenException when user tries to access another user task', async () => {
      // Arrange
      const taskId = 'task-123';
      const mockUser = {
        id: 'user-123',
        email: 'user@example.com',
        role: UserRole.USER,
      };

      const mockTask = {
        id: taskId,
        title: 'Other User Task',
        description: 'Description',
        status: TaskStatus.IN_PROGRESS,
        userId: 'user-456', // Different user ID
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest
        .spyOn(prismaService.task, 'findUnique')
        .mockResolvedValue(mockTask as any);

      // Act & Assert
      await expect(service.getTaskById(taskId, mockUser)).rejects.toThrow(
        ForbiddenException,
      );
      await expect(service.getTaskById(taskId, mockUser)).rejects.toThrow(
        'You do not have permission to view this task',
      );
    });
  });

  describe('createTask', () => {
    it('should create a new task successfully', async () => {
      // Arrange
      const mockUser = {
        id: 'user-123',
        email: 'user@example.com',
        role: UserRole.USER,
      };

      const createTaskDto: CreateTaskDto = {
        title: 'New Task',
        description: 'New Description',
        status: TaskStatus.IN_PROGRESS,
      };

      const createdTask = {
        id: 'new-task-123',
        title: 'New Task',
        description: 'New Description',
        status: TaskStatus.IN_PROGRESS,
        userId: 'user-123', // Should be linked to the user
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const createSpy = jest
        .spyOn(prismaService.task, 'create')
        .mockResolvedValue(createdTask as any);

      // Act
      const result = await service.createTask(createTaskDto, mockUser);

      // Assert
      expect(createSpy).toHaveBeenCalledWith({
        data: {
          title: 'New Task',
          description: 'New Description',
          status: TaskStatus.IN_PROGRESS,
          userId: 'user-123', // Should be linked to the logged-in user
        },
        select: {
          id: true,
          title: true,
          description: true,
          status: true,
          userId: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      expect(result.success).toBe(true);
      expect(result.data).toEqual(createdTask);
      expect(result?.data?.userId).toBe('user-123');
      expect(result.message).toBe('Task created successfully');
    });

    it('should create task with default status when status not provided', async () => {
      // Arrange
      const mockUser = {
        id: 'user-123',
        email: 'user@example.com',
        role: UserRole.USER,
      };

      const createTaskDto: CreateTaskDto = {
        title: 'New Task',
        // status not provided, should default to IN_PROGRESS
      };

      const createdTask = {
        id: 'new-task-123',
        title: 'New Task',
        description: '', // Should default to empty string
        status: TaskStatus.IN_PROGRESS, // Should default to IN_PROGRESS
        userId: 'user-123',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const createSpy = jest
        .spyOn(prismaService.task, 'create')
        .mockResolvedValue(createdTask as any);

      // Act
      const result = await service.createTask(createTaskDto, mockUser);

      // Assert
      expect(createSpy).toHaveBeenCalledWith({
        data: {
          title: 'New Task',
          description: '', // Should default to empty string
          status: TaskStatus.IN_PROGRESS, // Should default to IN_PROGRESS
          userId: 'user-123',
        },
        select: {
          id: true,
          title: true,
          description: true,
          status: true,
          userId: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      expect(result.success).toBe(true);
      expect(result?.data?.status).toBe(TaskStatus.IN_PROGRESS);
    });
  });

  describe('updateTask', () => {
    it('should update a task when user owns it', async () => {
      // Arrange
      const taskId = 'task-123';
      const mockUser = {
        id: 'user-123',
        email: 'user@example.com',
        role: UserRole.USER,
      };

      const updateTaskDto: UpdateTaskDto = {
        title: 'Updated Title',
        status: TaskStatus.COMPLETED,
      };

      const existingTask = {
        id: taskId,
        title: 'Original Title',
        description: 'Original Description',
        status: TaskStatus.IN_PROGRESS,
        userId: 'user-123', // User owns this task
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedTask = {
        id: taskId,
        title: 'Updated Title',
        description: 'Original Description',
        status: TaskStatus.COMPLETED,
        userId: 'user-123',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Mock findUnique for existence check
      const findUniqueSpy = jest
        .spyOn(prismaService.task, 'findUnique')
        .mockResolvedValue(existingTask as any);

      // Mock update for the actual update
      const updateSpy = jest
        .spyOn(prismaService.task, 'update')
        .mockResolvedValue(updatedTask as any);

      // Act
      const result = await service.updateTask(taskId, updateTaskDto, mockUser);

      // Assert
      // Should check if task exists first
      expect(findUniqueSpy).toHaveBeenCalledWith({
        where: { id: taskId },
      });

      // Should update only provided fields
      expect(updateSpy).toHaveBeenCalledWith({
        where: { id: taskId },
        data: {
          title: 'Updated Title',
          status: TaskStatus.COMPLETED,
          // description not in updateTaskDto, so not included
        },
        select: {
          id: true,
          title: true,
          description: true,
          status: true,
          userId: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      expect(result.success).toBe(true);
      expect(result?.data?.title).toBe('Updated Title');
      expect(result?.data?.status).toBe(TaskStatus.COMPLETED);
      expect(result.message).toBe('Task updated successfully');
    });

    it('should throw NotFoundException when task does not exist', async () => {
      // Arrange
      const taskId = 'non-existent-task';
      const mockUser = {
        id: 'user-123',
        email: 'user@example.com',
        role: UserRole.USER,
      };

      const updateTaskDto: UpdateTaskDto = {
        title: 'Updated Title',
      };

      jest.spyOn(prismaService.task, 'findUnique').mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.updateTask(taskId, updateTaskDto, mockUser),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when user tries to update another user task', async () => {
      // Arrange
      const taskId = 'task-123';
      const mockUser = {
        id: 'user-123',
        email: 'user@example.com',
        role: UserRole.USER,
      };

      const updateTaskDto: UpdateTaskDto = {
        title: 'Updated Title',
      };

      const existingTask = {
        id: taskId,
        title: 'Original Title',
        description: 'Description',
        status: TaskStatus.IN_PROGRESS,
        userId: 'user-456', // Different user
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest
        .spyOn(prismaService.task, 'findUnique')
        .mockResolvedValue(existingTask as any);

      // Act & Assert
      await expect(
        service.updateTask(taskId, updateTaskDto, mockUser),
      ).rejects.toThrow(ForbiddenException);
      await expect(
        service.updateTask(taskId, updateTaskDto, mockUser),
      ).rejects.toThrow('You do not have permission to update this task');
    });

    it('should allow admin to update any task', async () => {
      // Arrange
      const taskId = 'task-123';
      const mockAdmin = {
        id: 'admin-123',
        email: 'admin@example.com',
        role: UserRole.ADMIN,
      };

      const updateTaskDto: UpdateTaskDto = {
        title: 'Updated Title',
      };

      const existingTask = {
        id: taskId,
        title: 'Original Title',
        description: 'Description',
        status: TaskStatus.IN_PROGRESS,
        userId: 'user-456', // Different user, but admin can update
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedTask = {
        ...existingTask,
        title: 'Updated Title',
      };

      jest
        .spyOn(prismaService.task, 'findUnique')
        .mockResolvedValue(existingTask as any);
      jest
        .spyOn(prismaService.task, 'update')
        .mockResolvedValue(updatedTask as any);

      // Act
      const result = await service.updateTask(taskId, updateTaskDto, mockAdmin);

      // Assert
      expect(result.success).toBe(true);
      expect(result?.data?.title).toBe('Updated Title');
    });

    it('should only update provided fields (partial update)', async () => {
      // Arrange
      const taskId = 'task-123';
      const mockUser = {
        id: 'user-123',
        email: 'user@example.com',
        role: UserRole.USER,
      };

      const updateTaskDto: UpdateTaskDto = {
        description: 'Updated Description',
        // Only description provided, title and status should not be updated
      };

      const existingTask = {
        id: taskId,
        title: 'Original Title',
        description: 'Original Description',
        status: TaskStatus.IN_PROGRESS,
        userId: 'user-123',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedTask = {
        ...existingTask,
        description: 'Updated Description',
      };

      const findUniqueSpy = jest
        .spyOn(prismaService.task, 'findUnique')
        .mockResolvedValue(existingTask as any);
      const updateSpy = jest
        .spyOn(prismaService.task, 'update')
        .mockResolvedValue(updatedTask as any);

      // Act
      const result = await service.updateTask(taskId, updateTaskDto, mockUser);

      // Assert
      // Should only include description in the update data
      expect(updateSpy).toHaveBeenCalledWith({
        where: { id: taskId },
        data: {
          description: 'Updated Description',
        },
        select: expect.any(Object),
      });

      expect(result.success).toBe(true);
    });
  });

  describe('deleteTask', () => {
    it('should delete a task when user owns it', async () => {
      // Arrange
      const taskId = 'task-123';
      const mockUser = {
        id: 'user-123',
        email: 'user@example.com',
        role: UserRole.USER,
      };

      const existingTask = {
        id: taskId,
        title: 'Task to Delete',
        description: 'Description',
        status: TaskStatus.IN_PROGRESS,
        userId: 'user-123',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const deletedTask = { ...existingTask };

      const findUniqueSpy = jest
        .spyOn(prismaService.task, 'findUnique')
        .mockResolvedValue(existingTask as any);
      const deleteSpy = jest
        .spyOn(prismaService.task, 'delete')
        .mockResolvedValue(deletedTask as any);

      // Act
      const result = await service.deleteTask(taskId, mockUser);

      // Assert
      expect(findUniqueSpy).toHaveBeenCalledWith({
        where: { id: taskId },
      });

      expect(deleteSpy).toHaveBeenCalledWith({
        where: { id: taskId },
        select: {
          id: true,
          title: true,
          description: true,
          status: true,
          userId: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      expect(result.success).toBe(true);
      expect(result.data).toEqual(deletedTask);
      expect(result.message).toBe('Task deleted successfully');
    });

    it('should throw NotFoundException when task does not exist', async () => {
      // Arrange
      const taskId = 'non-existent-task';
      const mockUser = {
        id: 'user-123',
        email: 'user@example.com',
        role: UserRole.USER,
      };

      jest.spyOn(prismaService.task, 'findUnique').mockResolvedValue(null);

      // Act & Assert
      await expect(service.deleteTask(taskId, mockUser)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException when user tries to delete another user task', async () => {
      // Arrange
      const taskId = 'task-123';
      const mockUser = {
        id: 'user-123',
        email: 'user@example.com',
        role: UserRole.USER,
      };

      const existingTask = {
        id: taskId,
        title: 'Task',
        description: 'Description',
        status: TaskStatus.IN_PROGRESS,
        userId: 'user-456', // Different user
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest
        .spyOn(prismaService.task, 'findUnique')
        .mockResolvedValue(existingTask as any);

      // Act & Assert
      await expect(service.deleteTask(taskId, mockUser)).rejects.toThrow(
        ForbiddenException,
      );
      await expect(service.deleteTask(taskId, mockUser)).rejects.toThrow(
        'You do not have permission to delete this task',
      );
    });

    it('should allow admin to delete any task', async () => {
      // Arrange
      const taskId = 'task-123';
      const mockAdmin = {
        id: 'admin-123',
        email: 'admin@example.com',
        role: UserRole.ADMIN,
      };

      const existingTask = {
        id: taskId,
        title: 'Task',
        description: 'Description',
        status: TaskStatus.IN_PROGRESS,
        userId: 'user-456', // Different user, but admin can delete
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const findUniqueSpy = jest
        .spyOn(prismaService.task, 'findUnique')
        .mockResolvedValue(existingTask as any);
      const deleteSpy = jest
        .spyOn(prismaService.task, 'delete')
        .mockResolvedValue(existingTask as any);

      // Act
      const result = await service.deleteTask(taskId, mockAdmin);

      // Assert
      expect(result.success).toBe(true);
      expect(deleteSpy).toHaveBeenCalled();
    });
  });
});
