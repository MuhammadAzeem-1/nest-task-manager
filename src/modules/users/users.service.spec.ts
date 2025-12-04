import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';

/**
 * Unit Tests for UsersService
 *
 * What dependencies does UsersService need?
 * - PrismaService: For database operations (user CRUD)
 * - StorageService: For file uploads (profile pictures)
 *
 * In unit tests, we mock these dependencies so we can:
 * - Control what they return
 * - Test the service logic in isolation
 * - Avoid hitting real databases or storage services
 */
describe('UsersService', () => {
  let service: UsersService;
  let prismaService: PrismaService;
  let storageService: StorageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          // Mock PrismaService
          provide: PrismaService,
          useValue: {
            // Mock all Prisma methods used by UsersService
            user: {
              findMany: jest.fn(), // Used in getAllUsers
              findUnique: jest.fn(), // Used in getUserById, updateUser, deleteUser, findByEmail
              create: jest.fn(), // Used in createUser
              update: jest.fn(), // Used in updateUser, uploadProfilePicture
              delete: jest.fn(), // Used in deleteUser
            },
          },
        },
        {
          // Mock StorageService
          provide: StorageService,
          useValue: {
            // Mock methods used for file operations
            uploadFile: jest.fn(), // Used in uploadProfilePicture
            deleteFile: jest.fn(), // Used in uploadProfilePicture (to delete old picture)
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prismaService = module.get<PrismaService>(PrismaService);
    storageService = module.get<StorageService>(StorageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
