import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

/**
 * Unit Tests for AuthService
 *
 * What dependencies does AuthService need?
 * - PrismaService: For database operations (user creation, finding users)
 * - JwtService: For generating JWT tokens
 *
 * In unit tests, we mock these dependencies so we can:
 * - Control what they return
 * - Test the service logic in isolation
 * - Avoid hitting real databases or external services
 */
describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          // Mock PrismaService
          provide: PrismaService,
          useValue: {
            // Mock all Prisma methods used by AuthService
            user: {
              findUnique: jest.fn(), // Used in signup and login
              create: jest.fn(), // Used in signup
            },
          },
        },
        {
          // Mock JwtService
          provide: JwtService,
          useValue: {
            // Mock the sign method used to generate tokens
            sign: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    // prismaService = module.get<PrismaService>(PrismaService);
    // jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
