import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Put,
  Post,
  HttpCode,
  HttpStatus,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiResponse } from 'src/config/types';
import { PublicUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from './enums/user-role.enum';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  async getAllUsers(): Promise<ApiResponse<PublicUserDto[]>> {
    return await this.usersService.getAllUsers();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getUserById(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ): Promise<ApiResponse<PublicUserDto>> {
    return await this.usersService.getUserById(id, user);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() user: any,
  ): Promise<ApiResponse<PublicUserDto>> {
    return await this.usersService.updateUser(id, updateUserDto, user);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  async deleteUser(
    @Param('id') id: string,
  ): Promise<ApiResponse<PublicUserDto>> {
    return await this.usersService.deleteUser(id);
  }

  @Post(':id/profile-picture')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max file size
      },
      fileFilter: (req, file, cb) => {
        // Allow only image files
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
          return cb(
            new BadRequestException(
              'Only image files (jpg, jpeg, png, gif, webp) are allowed',
            ),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  async uploadProfilePicture(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: any,
  ): Promise<ApiResponse<PublicUserDto>> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    return await this.usersService.uploadProfilePicture(id, file, user);
  }
}
