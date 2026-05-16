import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { existsSync, mkdirSync } from 'fs';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UpdateRoutePreferenceDto } from './dto/update-route-preference.dto';
import { UpdateGenderDto } from './dto/update-gender.dto';
import { UserRole } from './entities/user.entity';
import { UserService } from './user.service';

const profilePictureDirectory = join(
  process.cwd(),
  'uploads',
  'profile-pictures',
);

if (!existsSync(profilePictureDirectory)) {
  mkdirSync(profilePictureDirectory, { recursive: true });
}

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.STUDENT, UserRole.ADMIN)
  @Patch('me/route-preference')
  updateRoutePreference(
    @Body() updateRoutePreferenceDto: UpdateRoutePreferenceDto,
    @Req() req,
  ) {
    return this.userService.updateRoutePreference(
      req.user.id,
      updateRoutePreferenceDto,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.STUDENT, UserRole.ADMIN)
  @Patch('me/gender')
  updateGender(@Body() updateGenderDto: UpdateGenderDto, @Req() req) {
    return this.userService.updateGender(req.user.id, updateGenderDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.STUDENT, UserRole.ADMIN)
  @Patch('me/profile-picture')
  @UseInterceptors(
    FileInterceptor('profilePicture', {
      storage: diskStorage({
        destination: profilePictureDirectory,
        filename: (req, file, callback) => {
          const uniqueSuffix = `${Date.now()}-${Math.round(
            Math.random() * 1e9,
          )}`;
          callback(null, `profile-${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.startsWith('image/')) {
          callback(new BadRequestException('Only image files are allowed'), false);
          return;
        }

        callback(null, true);
      },
      limits: {
        fileSize: 2 * 1024 * 1024,
      },
    }),
  )
  uploadProfilePicture(@UploadedFile() file, @Req() req) {
    if (!file) {
      throw new BadRequestException('Profile picture is required');
    }

    return this.userService.updateProfilePicture(
      req.user.id,
      `/users/profile-picture/${file.filename}`,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.STUDENT, UserRole.ADMIN)
  @Delete('me/profile-picture')
  clearProfilePicture(@Req() req) {
    return this.userService.clearProfilePicture(req.user.id);
  }

  @Get('profile-picture/:filename')
  getProfilePicture(@Param('filename') filename: string, @Res() res: Response) {
    return res.sendFile(filename, {
      root: profilePictureDirectory,
    });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req) {
    return this.userService.remove(+id, req.user.id);
  }
}
