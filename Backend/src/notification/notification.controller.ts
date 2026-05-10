import { Controller, Get, Param, Patch, Req, UseGuards } from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../user/entities/user.entity';
import { NotificationService } from './notification.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.STUDENT, UserRole.ADMIN)
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get('my')
  findMyNotifications(@Req() req) {
    return this.notificationService.findMyNotifications(req.user.id);
  }

  @Patch(':id/read')
  markAsRead(@Param('id') id: string, @Req() req) {
    return this.notificationService.markAsRead(+id, req.user.id);
  }
}
