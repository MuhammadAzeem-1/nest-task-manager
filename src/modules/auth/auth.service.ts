import {
  ConflictException,
  Injectable,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { ApiResponse } from 'src/config/types';
import { UserRole } from '../users/enums/user-role.enum';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async signup(dto: SignupDto): Promise<ApiResponse<any>> {
    try {
      // Check if user already exists
      const userExists = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });

      if (userExists) {
        this.logger.warn(`Signup attempt with existing email: ${dto.email}`);
        throw new ConflictException('User with this email already exists');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(dto.password, 10);

      // Create user
      const user = await this.prisma.user.create({
        data: {
          name: dto.name,
          email: dto.email,
          password: hashedPassword,
          role: UserRole.USER, // Default role
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      // Generate JWT token
      const token = this.generateToken(user.id, user.email, user.role);

      this.logger.log(`User registered successfully: ${user.email}`);

      return {
        success: true,
        message: 'User registered successfully',
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          },
          access_token: token,
        },
        error: null,
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      this.logger.error(`Signup error: ${error}`);
      throw error;
    }
  }

  async login(dto: LoginDto): Promise<ApiResponse<any>> {
    try {
      // Find user by email
      const user = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });

      if (!user) {
        this.logger.warn(`Login attempt with non-existent email: ${dto.email}`);
        throw new UnauthorizedException('Invalid credentials');
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(dto.password, user.password);

      if (!isPasswordValid) {
        this.logger.warn(`Failed login attempt for email: ${dto.email}`);
        throw new UnauthorizedException('Invalid credentials');
      }

      // Generate JWT token
      const token = this.generateToken(user.id, user.email, user.role);

      this.logger.log(`User logged in successfully: ${user.email}`);

      return {
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          },
          access_token: token,
        },
        error: null,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      this.logger.error(`Login error: ${error}`);
      throw error;
    }
  }

  async validateUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  private generateToken(userId: string, email: string, role: string): string {
    const payload = {
      sub: userId,
      email: email,
      role: role,
    };

    return this.jwtService.sign(payload);
  }
}
