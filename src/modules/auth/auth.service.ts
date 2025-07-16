import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { SignupDto } from './dto/signup.dto';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { ApiResponse } from 'src/config/types';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async signup(dto: SignupDto): Promise<ApiResponse<any>> {
    try {
      const userExists = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });

      if (userExists) {
        throw new ConflictException('User already exists');
      }

      const saltRounds = 10;

      const hashedPassword = await bcrypt.hash(dto.password, saltRounds);

      const user = await this.prisma.user.create({
        data: {
          name: dto.name,
          email: dto.email,
          password: hashedPassword,
        },
      });

      const token = 'lorem3';

      return {
        success: true,
        message: 'User created successfully',
        data: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        token,
        error: null,
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error; // Re-throw the conflict exception
      }

      throw new InternalServerErrorException('User creation failed');
    }
  }
}
