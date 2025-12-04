import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

/**
 * Unit Tests for AuthController
 *
 * What dependencies does AuthController need?
 * - AuthService: The service that handles authentication logic
 *
 * In unit tests, we mock the service so we can:
 * - Test controller logic without real authentication
 * - Control what the service returns
 * - Test different scenarios (success, errors, etc.)
 */
describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          // Mock AuthService
          provide: AuthService,
          useValue: {
            // Mock all methods used by the controller
            signup: jest.fn(),
            login: jest.fn(),
            validateUser: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    // service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
