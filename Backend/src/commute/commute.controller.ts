import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { CommuteService } from './commute.service';
import { CreateCommuteDto } from './dto/create-commute.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../user/entities/user.entity';

@Controller('commutes')
export class CommuteController {
  constructor(private readonly commuteService: CommuteService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.STUDENT)
  @Post()
  create(@Body() createCommuteDto: CreateCommuteDto, @Req() req) {
    return this.commuteService.create(createCommuteDto, req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.STUDENT, UserRole.ADMIN)
  @Get()
  findAll() {
    return this.commuteService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.STUDENT, UserRole.ADMIN)
  @Get('my')
  findMyCommutes(@Req() req) {
    return this.commuteService.findMyCommutes(req.user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.STUDENT, UserRole.ADMIN)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.commuteService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.STUDENT, UserRole.ADMIN)
  @Patch(':id/close')
  close(@Param('id') id: string, @Req() req) {
    return this.commuteService.close(+id, req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.STUDENT, UserRole.ADMIN)
  @Patch(':id/cancel')
  cancel(@Param('id') id: string, @Req() req) {
    return this.commuteService.cancel(+id, req.user);
  }
}
