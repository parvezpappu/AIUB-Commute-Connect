import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../user/entities/user.entity';
import { CreateCommuteRatingsDto } from './dto/create-commute-ratings.dto';
import { RatingService } from './rating.service';

@Controller('commutes')
export class RatingController {
  constructor(private readonly ratingService: RatingService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.STUDENT, UserRole.ADMIN)
  @Post(':id/ratings')
  createCommuteRatings(
    @Param('id') id: string,
    @Body() createCommuteRatingsDto: CreateCommuteRatingsDto,
    @Req() req,
  ) {
    return this.ratingService.createCommuteRatings(
      +id,
      req.user,
      createCommuteRatingsDto,
    );
  }
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.STUDENT, UserRole.ADMIN)
@Controller('ratings')
export class UserRatingController {
  constructor(private readonly ratingService: RatingService) {}

  @Get('users/:id/summary')
  getUserRatingSummary(@Param('id') id: string) {
    return this.ratingService.getUserRatingSummary(+id);
  }
}
