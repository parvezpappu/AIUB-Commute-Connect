import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Commute } from '../commute/entities/commute.entity';
import {
  Participation,
  ParticipationStatus,
} from '../participation/entities/participation.entity';
import { User, UserRole } from '../user/entities/user.entity';
import { CreateCommuteRatingsDto } from './dto/create-commute-ratings.dto';
import { CommuteRating, RatingType } from './entities/commute-rating.entity';

@Injectable()
export class RatingService {
  constructor(
    @InjectRepository(CommuteRating)
    private readonly ratingRepository: Repository<CommuteRating>,
    @InjectRepository(Commute)
    private readonly commuteRepository: Repository<Commute>,
    @InjectRepository(Participation)
    private readonly participationRepository: Repository<Participation>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createCommuteRatings(
    commuteId: number,
    currentUser: User,
    createCommuteRatingsDto: CreateCommuteRatingsDto,
  ) {
    const commute = await this.commuteRepository.findOne({
      where: { id: commuteId },
    });

    if (!commute) {
      throw new NotFoundException('Commute not found');
    }

    const acceptedParticipants = await this.participationRepository.find({
      where: {
        commute: { id: commuteId },
        status: ParticipationStatus.ACCEPTED,
      },
    });

    const isCreator = commute.creator.id === currentUser.id;
    const isAdmin = currentUser.role === UserRole.ADMIN;
    const isAcceptedMember = acceptedParticipants.some(
      (participant) => participant.user.id === currentUser.id,
    );

    if (!isCreator && !isAdmin && !isAcceptedMember) {
      throw new ForbiddenException('You are not allowed to rate this commute');
    }

    const existingRating = await this.ratingRepository.findOne({
      where: {
        commute: { id: commuteId },
        rater: { id: currentUser.id },
      },
    });

    if (existingRating) {
      throw new BadRequestException('You already submitted feedback for this commute');
    }

    const rateableUserIds = new Set([
      commute.creator.id,
      ...acceptedParticipants.map((participant) => participant.user.id),
    ]);
    rateableUserIds.delete(currentUser.id);

    const requestedUserIds = createCommuteRatingsDto.userRatings.map(
      (item) => item.ratedUserId,
    );
    const invalidUserId = requestedUserIds.find(
      (userId) => !rateableUserIds.has(userId),
    );

    if (invalidUserId) {
      throw new BadRequestException('One or more rated users are not in this commute');
    }

    const ratedUsers = requestedUserIds.length
      ? await this.userRepository.find({
          where: {
            id: In(requestedUserIds),
          },
        })
      : [];

    const ratings: CommuteRating[] = [];

    if (createCommuteRatingsDto.overallRating) {
      ratings.push(
        this.ratingRepository.create({
          commute,
          rater: currentUser,
          ratedUser: null,
          type: RatingType.TRIP,
          rating: createCommuteRatingsDto.overallRating,
        }),
      );
    }

    createCommuteRatingsDto.userRatings.forEach((item) => {
      const ratedUser = ratedUsers.find((user) => user.id === item.ratedUserId);

      if (!ratedUser) {
        return;
      }

      ratings.push(
        this.ratingRepository.create({
          commute,
          rater: currentUser,
          ratedUser,
          type: RatingType.USER,
          rating: item.rating,
        }),
      );
    });

    if (ratings.length === 0) {
      return {
        message: 'No ratings submitted',
      };
    }

    await this.ratingRepository.save(ratings);

    return {
      message: 'Feedback submitted successfully',
    };
  }

  async getUserRatingSummary(userId: number) {
    const ratings = await this.ratingRepository.find({
      where: {
        ratedUser: { id: userId },
        type: RatingType.USER,
      },
    });

    if (ratings.length === 0) {
      return {
        averageRating: null,
        ratingCount: 0,
      };
    }

    const total = ratings.reduce((sum, rating) => sum + rating.rating, 0);

    return {
      averageRating: Number((total / ratings.length).toFixed(1)),
      ratingCount: ratings.length,
    };
  }
}
