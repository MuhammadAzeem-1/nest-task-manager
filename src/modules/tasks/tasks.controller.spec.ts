import { Test, TestingModule } from '@nestjs/testing';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { CreateTaskDto, PublicTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskStatus } from './enums/task-status.enum';
import { UserRole } from '../users/enums/user-role.enum';

/**
 * Unit Tests for TasksController
 *
 * What is a Unit Test?
 * - A unit test tests a single unit (class/function) in isolation
 * - We mock all dependencies so we only test the controller logic
 * - This ensures the controller works correctly regardless of service implementation
 *
 * What is Mocking?
 * - Mocking creates fake versions of dependencies
 * - We control what the mock returns, so tests are predictable
 * - This allows us to test different scenarios (success, errors, etc.)
 */
describe('TasksController', () => {
  // Declare variables that will hold our controller and mocked service
  let controller: TasksController;
  let service: TasksService;

  /**
   * beforeEach is a Jest hook that runs before each test
   * This ensures each test starts with a fresh, clean setup
   */
  beforeEach(async () => {
    /**
     * Test.createTestingModule() creates a NestJS testing module
     * This is similar to creating a real NestJS module, but for testing
     * It allows us to provide mocks instead of real dependencies
     */
    const module: TestingModule = await Test.createTestingModule({
      // Controllers array: list all controllers we want to test
      controllers: [TasksController],
      // Providers array: list services that the controller depends on
      // We use provide() to create a mock service
      providers: [
        {
          // provide: tells NestJS what token to use (TasksService)
          provide: TasksService,
          // useValue: provides a mock object that replaces the real service
          // This mock has the same methods as TasksService, but we control their behavior
          useValue: {
            // Mock implementation of getAllTasks method
            // jest.fn() creates a mock function we can control in tests
            getAllTasks: jest.fn(),
            getTaskById: jest.fn(),
            createTask: jest.fn(),
            updateTask: jest.fn(),
            deleteTask: jest.fn(),
          },
        },
      ],
    }).compile(); // compile() builds the testing module

    /**
     * module.get() retrieves an instance from the testing module
     * This is how we get the controller and service instances for testing
     */
    controller = module.get<TasksController>(TasksController);
    service = module.get<TasksService>(TasksService);
  });

  /**
   * it() or test() defines a single test case
   * The first parameter is a description of what we're testing
   * The second parameter is a function that contains the test logic
   */
  it('should be defined', () => {
    // expect() is Jest's assertion function
    // toBeDefined() checks that the controller exists and is not undefined
    expect(controller).toBeDefined();
  });

  /**
   * describe() groups related tests together
   * This helps organize tests by functionality
   */
  describe('getAllTasks', () => {
    it('should return all tasks for a user', async () => {
      // Arrange: Set up test data and mock behavior
      // This is the "Given" part of Given-When-Then testing pattern

      // Create a mock user object
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        role: UserRole.USER,
      };

      // Create mock tasks that the service should return
      const mockTasks: PublicTaskDto[] = [
        {
          id: 'task-1',
          title: 'Test Task 1',
          description: 'Description 1',
          status: TaskStatus.IN_PROGRESS,
          userId: 'user-123',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'task-2',
          title: 'Test Task 2',
          description: 'Description 2',
          status: TaskStatus.COMPLETED,
          userId: 'user-123',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      // Create the expected API response structure
      const mockResponse = {
        success: true,
        data: mockTasks,
        error: null,
        message: 'Retrieved 2 tasks',
      };

      /**
       * Mock the service method to return our expected response
       * mockResolvedValue() makes the async function return a resolved promise
       * This simulates a successful service call
       */
      const getAllTasksSpy = jest
        .spyOn(service, 'getAllTasks')
        .mockResolvedValue(mockResponse);

      // Act: Execute the method we're testing
      // This is the "When" part
      const result = await controller.getAllTasks(mockUser);

      // Assert: Verify the results
      // This is the "Then" part

      // Check that the service method was called with correct parameters
      // Note: We assert on the spy, not the result of calling it
      expect(getAllTasksSpy).toHaveBeenCalledWith(mockUser);

      // Check that the result matches what we expected
      expect(result).toEqual(mockResponse);
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
    });

    it('should return all tasks for an admin user', async () => {
      // Test that admin users can see all tasks
      const mockAdmin = {
        id: 'admin-123',
        email: 'admin@example.com',
        role: UserRole.ADMIN,
      };

      const mockTasks: PublicTaskDto[] = [
        {
          id: 'task-1',
          title: 'Task 1',
          description: 'Description 1',
          status: TaskStatus.IN_PROGRESS,
          userId: 'user-123',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const mockResponse = {
        success: true,
        data: mockTasks,
        error: null,
        message: 'Retrieved 1 tasks',
      };

      const getAllTasksSpy = jest
        .spyOn(service, 'getAllTasks')
        .mockResolvedValue(mockResponse);

      const result = await controller.getAllTasks(mockAdmin);

      // Assert on the spy, not the result of calling the method
      expect(getAllTasksSpy).toHaveBeenCalledWith(mockAdmin);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getTaskById', () => {
    it('should return a task by id', async () => {
      // Arrange
      const taskId = 'task-123';
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        role: UserRole.USER,
      };

      const mockTask: PublicTaskDto = {
        id: taskId,
        title: 'Test Task',
        description: 'Test Description',
        status: TaskStatus.IN_PROGRESS,
        userId: 'user-123',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockResponse = {
        success: true,
        data: mockTask,
        error: null,
        message: 'Task retrieved successfully',
      };

      const getTaskByIdSpy = jest
        .spyOn(service, 'getTaskById')
        .mockResolvedValue(mockResponse);

      // Act
      const result = await controller.getTaskById(taskId, mockUser);

      // Assert
      // toHaveBeenCalledWith() verifies the method was called with specific arguments
      // Assert on the spy, not the result of calling it
      expect(getTaskByIdSpy).toHaveBeenCalledWith(taskId, mockUser);
      expect(result).toEqual(mockResponse);
      expect(result?.data?.id).toBe(taskId);
    });
  });

  describe('createTask', () => {
    it('should create a new task', async () => {
      // Arrange
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        role: UserRole.USER,
      };

      const createTaskDto: CreateTaskDto = {
        title: 'New Task',
        description: 'New Description',
        status: TaskStatus.IN_PROGRESS,
      };

      const createdTask: PublicTaskDto = {
        id: 'new-task-123',
        title: 'New Task',
        description: 'New Description',
        status: TaskStatus.IN_PROGRESS,
        userId: 'user-123',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockResponse = {
        success: true,
        data: createdTask,
        error: null,
        message: 'Task created successfully',
      };

      const createTaskSpy = jest
        .spyOn(service, 'createTask')
        .mockResolvedValue(mockResponse);

      // Act
      const result = await controller.createTask(createTaskDto, mockUser);

      // Assert
      // Assert on the spy, not the result of calling the method
      expect(createTaskSpy).toHaveBeenCalledWith(createTaskDto, mockUser);
      expect(result).toEqual(mockResponse);
      expect(result?.data?.title).toBe('New Task');
      expect(result?.data?.userId).toBe('user-123');
    });
  });

  describe('updateTask', () => {
    it('should update an existing task', async () => {
      // Arrange
      const taskId = 'task-123';
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        role: UserRole.USER,
      };

      const updateTaskDto: UpdateTaskDto = {
        title: 'Updated Task',
        status: TaskStatus.COMPLETED,
      };

      const updatedTask: PublicTaskDto = {
        id: taskId,
        title: 'Updated Task',
        description: 'Original Description',
        status: TaskStatus.COMPLETED,
        userId: 'user-123',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockResponse = {
        success: true,
        data: updatedTask,
        error: null,
        message: 'Task updated successfully',
      };

      const updateTaskSpy = jest
        .spyOn(service, 'updateTask')
        .mockResolvedValue(mockResponse);

      // Act
      const result = await controller.updateTask(
        taskId,
        updateTaskDto,
        mockUser,
      );

      // Assert
      // Assert on the spy, not the result of calling the method
      expect(updateTaskSpy).toHaveBeenCalledWith(
        taskId,
        updateTaskDto,
        mockUser,
      );
      expect(result).toEqual(mockResponse);
      expect(result?.data?.status).toBe(TaskStatus.COMPLETED);
    });
  });

  describe('deleteTask', () => {
    it('should delete a task', async () => {
      // Arrange
      const taskId = 'task-123';
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        role: UserRole.USER,
      };

      const deletedTask: PublicTaskDto = {
        id: taskId,
        title: 'Deleted Task',
        description: 'Description',
        status: TaskStatus.IN_PROGRESS,
        userId: 'user-123',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockResponse = {
        success: true,
        data: deletedTask,
        error: null,
        message: 'Task deleted successfully',
      };

      const deleteTaskSpy = jest
        .spyOn(service, 'deleteTask')
        .mockResolvedValue(mockResponse);

      // Act
      const result = await controller.deleteTask(taskId, mockUser);

      // Assert
      // Assert on the spy, not the result of calling the method
      expect(deleteTaskSpy).toHaveBeenCalledWith(taskId, mockUser);
      expect(result).toEqual(mockResponse);
      expect(result?.data?.id).toBe(taskId);
    });
  });
});
