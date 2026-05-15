import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Commute } from '../commute/entities/commute.entity';
import { Participation } from '../participation/entities/participation.entity';
import { User } from '../user/entities/user.entity';
import { CommuteRating } from './entities/commute-rating.entity';
import { RatingController, UserRatingController } from './rating.controller';
import { RatingService } from './rating.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([CommuteRating, Commute, Participation, User]),
  ],
  controllers: [RatingController, UserRatingController],
  providers: [RatingService],
})
export class RatingModule {}
