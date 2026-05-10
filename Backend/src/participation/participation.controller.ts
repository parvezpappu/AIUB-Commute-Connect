import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../user/entities/user.entity';
import { UpdateParticipationDto } from './dto/update-participation.dto';
import { ParticipationService } from './participation.service';

@Controller()
export class ParticipationController {
  constructor(private readonly participationService: ParticipationService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.STUDENT)
  @Post('commutes/:id/join')
  joinCommute(@Param('id') id: string, @Req() req) {
    return this.participationService.joinCommute(+id, req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.STUDENT, UserRole.ADMIN)
  @Get('commutes/:id/requests')
  findCommuteRequests(@Param('id') id: string, @Req() req) {
  return this.participationService.findCommuteRequests(+id, req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.STUDENT, UserRole.ADMIN)
  @Get('commutes/:id/participants')
  findAcceptedParticipants(@Param('id') id: string, @Req() req) {
    return this.participationService.findAcceptedParticipants(+id, req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.STUDENT, UserRole.ADMIN)
  @Patch('commutes/:id/request/:userId')
  updateJoinRequest(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Body() updateParticipationDto: UpdateParticipationDto,
    @Req() req,
  ) {
    return this.participationService.updateJoinRequest(
      +id,
      +userId,
      updateParticipationDto.status,
      req.user,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.STUDENT)
  @Delete('commutes/:id/leave')
  leaveCommute(@Param('id') id: string, @Req() req) {
    return this.participationService.leaveCommute(+id, req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.STUDENT, UserRole.ADMIN)
  @Get('participations/my')
  findMyParticipations(@Req() req) {
    return this.participationService.findMyParticipations(req.user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.STUDENT)
  @Delete('participations/my/:id')
  deleteMyHistoryParticipation(@Param('id') id: string, @Req() req) {
    return this.participationService.deleteMyHistoryParticipation(+id, req.user);
  }
}
