import {
  Injectable,
  NotFoundException,
  Logger,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { CreateUserDto, PublicUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import { ApiResponse } from 'src/config/types';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
// import { PrismaException } from 'src/common/exceptions/prisma.exception';
import { UserRole } from './enums/user-role.enum';
import { StorageService } from '../storage/storage.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private prisma: PrismaService,
    private storageService: StorageService,
  ) {}

  async getAllUsers(): Promise<ApiResponse<PublicUserDto[]>> {
    try {
      const users = await this.prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          profilePicture: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      this.logger.log(`Retrieved ${users.length} users`);

      return {
        success: true,
        data: users as PublicUserDto[],
        error: null,
        message:
          users.length === 0
            ? 'No users found'
            : `Retrieved ${users.length} users`,
      };
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        // throw new PrismaException(error);
      }
      this.logger.error(`Error fetching users: ${error}`, error);
      throw error;
    }
  }

  async getUserById(
    id: string,
    currentUser: any,
  ): Promise<ApiResponse<PublicUserDto>> {
    try {
      // Users can only view their own profile unless they're admin
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (currentUser.role !== UserRole.ADMIN && currentUser.id !== id) {
        this.logger.warn(
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          `User ${currentUser.email} attempted to view user ${id} without permission`,
        );
        throw new ForbiddenException(
          'You do not have permission to view this user',
        );
      }

      const user = await this.prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          profilePicture: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) {
        this.logger.warn(`User with ID ${id} not found`);
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      this.logger.log(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        `User ${currentUser.email} retrieved user with ID: ${id}`,
      );

      return {
        success: true,
        data: user as PublicUserDto,
        error: null,
        message: 'User retrieved successfully',
      };
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        // throw new PrismaException(error);
      }
      this.logger.error(`Error fetching user by ID: ${error}`, error);
      throw error;
    }
  }

  async createUser(user: CreateUserDto): Promise<ApiResponse<PublicUserDto>> {
    try {
      // Check if email already exists
      const existingUser = await this.prisma.user.findUnique({
        where: { email: user.email },
      });

      if (existingUser) {
        this.logger.warn(`User with email ${user.email} already exists`);
        throw new ConflictException(
          `User with email ${user.email} already exists`,
        );
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(user.password, 10);

      const newUser = await this.prisma.user.create({
        data: {
          name: user.name,
          email: user.email,
          password: hashedPassword,
          role: user.role || UserRole.USER,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          profilePicture: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      this.logger.log(`User created successfully with ID: ${newUser.id}`);

      return {
        success: true,
        data: newUser as PublicUserDto,
        error: null,
        message: 'User created successfully',
      };
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        // throw new PrismaException(error);
      }
      this.logger.error(`Error creating user: ${error}`, error);
      throw error;
    }
  }

  async updateUser(
    id: string,
    updatedUser: UpdateUserDto,
    currentUser: any,
  ): Promise<ApiResponse<PublicUserDto>> {
    try {
      // Users can only update their own profile unless they're admin
      // Regular users can't change their role
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (currentUser.role !== UserRole.ADMIN && currentUser.id !== id) {
        this.logger.warn(
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          `User ${currentUser.email} attempted to update user ${id} without permission`,
        );
        throw new ForbiddenException(
          'You do not have permission to update this user',
        );
      }

      // Regular users cannot change their own role
      if (
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        currentUser.role !== UserRole.ADMIN &&
        updatedUser.role !== undefined
      ) {
        this.logger.warn(
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          `User ${currentUser.email} attempted to change their own role`,
        );
        throw new ForbiddenException('You cannot change your own role');
      }

      // Check if user exists
      const existingUser = await this.prisma.user.findUnique({
        where: { id },
      });

      if (!existingUser) {
        this.logger.warn(`User with ID ${id} not found`);
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      // Check if email is being updated and if it already exists
      if (updatedUser.email && updatedUser.email !== existingUser.email) {
        const emailExists = await this.prisma.user.findUnique({
          where: { email: updatedUser.email },
        });

        if (emailExists) {
          this.logger.warn(`Email ${updatedUser.email} already in use`);
          throw new ConflictException(
            `Email ${updatedUser.email} already in use`,
          );
        }
      }

      // Build update data
      const dataToUpdate: Partial<UpdateUserDto> = {};
      if (updatedUser.name !== undefined) dataToUpdate.name = updatedUser.name;
      if (updatedUser.email !== undefined)
        dataToUpdate.email = updatedUser.email;
      if (updatedUser.role !== undefined) dataToUpdate.role = updatedUser.role;
      if (updatedUser.profilePicture !== undefined)
        dataToUpdate.profilePicture = updatedUser.profilePicture;

      // Hash password if being updated
      if (updatedUser.password !== undefined) {
        const hashedPassword = await bcrypt.hash(updatedUser.password, 10);
        dataToUpdate.password = hashedPassword;
      }

      const user = await this.prisma.user.update({
        where: { id },
        data: dataToUpdate,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          profilePicture: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      this.logger.log(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        `User ${currentUser.email} updated user with ID ${id} successfully`,
      );

      return {
        success: true,
        data: user as PublicUserDto,
        error: null,
        message: 'User updated successfully',
      };
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        // throw new PrismaException(error);
      }

      this.logger.error(`Error updating user: ${error}`, error);
      throw error;
    }
  }

  async deleteUser(id: string): Promise<ApiResponse<PublicUserDto>> {
    try {
      // Check if user exists
      const existingUser = await this.prisma.user.findUnique({
        where: { id },
      });

      if (!existingUser) {
        this.logger.warn(`User with ID ${id} not found`);
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      const user = await this.prisma.user.delete({
        where: { id },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          profilePicture: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      this.logger.log(`User with ID ${id} deleted successfully`);

      return {
        success: true,
        data: user as PublicUserDto,
        error: null,
        message: 'User deleted successfully',
      };
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        // throw new PrismaException(error);
      }
      this.logger.error(`Error deleting user with ID ${id}: ${error}`, error);
      throw error;
    }
  }

  // Helper method for auth module
  async findByEmail(email: string) {
    return await this.prisma.user.findUnique({
      where: { email },
    });
  }

  /**
   * Upload profile picture for a user
   */
  async uploadProfilePicture(
    id: string,
    file: Express.Multer.File,
    currentUser: any,
  ): Promise<ApiResponse<PublicUserDto>> {
    try {
      // Users can only update their own profile picture unless they're admin
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (currentUser.role !== UserRole.ADMIN && currentUser.id !== id) {
        this.logger.warn(
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          `User ${currentUser.email} attempted to update profile picture for user ${id} without permission`,
        );
        throw new ForbiddenException(
          'You do not have permission to update this profile picture',
        );
      }

      // Check if user exists
      const existingUser = await this.prisma.user.findUnique({
        where: { id },
      });

      if (!existingUser) {
        this.logger.warn(`User with ID ${id} not found`);
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      // Upload file to S3
      const fileUrl = await this.storageService.uploadFile(
        file.buffer,
        file.originalname,
        file.mimetype,
      );

      // Delete old profile picture if exists
      if (existingUser.profilePicture) {
        await this.storageService.deleteFile(existingUser.profilePicture);
      }

      // Update user with new profile picture URL
      const updatedUser = await this.prisma.user.update({
        where: { id },
        data: { profilePicture: fileUrl },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          profilePicture: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      this.logger.log(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        `User ${currentUser.email} updated profile picture for user ${id}`,
      );

      return {
        success: true,
        data: updatedUser as PublicUserDto,
        error: null,
        message: 'Profile picture updated successfully',
      };
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        // throw new PrismaException(error);
      }
      this.logger.error(`Error uploading profile picture: ${error}`, error);
      throw error;
    }
  }
}
