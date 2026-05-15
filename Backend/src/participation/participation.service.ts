import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Commute, CommuteStatus } from '../commute/entities/commute.entity';
import { User, UserRole } from '../user/entities/user.entity';
import { NotificationType } from '../notification/entities/notification.entity';
import { NotificationService } from '../notification/notification.service';
import { UpdateLocationDto } from './dto/update-location.dto';
import {
  Participation,
  ParticipationStatus,
} from './entities/participation.entity';

@Injectable()
export class ParticipationService {
  constructor(
    @InjectRepository(Participation)
    private readonly participationRepository: Repository<Participation>,

    @InjectRepository(Commute)
    private readonly commuteRepository: Repository<Commute>,

    private readonly notificationService: NotificationService,
  ) {}

  async joinCommute(commuteId: number, user: User) {
    if (!user.isVerified) {
      throw new ForbiddenException(
        'Please verify your email before joining a commute',
      );
    }

    const commute = await this.commuteRepository.findOne({
      where: { id: commuteId },
    });

    if (!commute) {
      throw new NotFoundException('Commute not found');
    }

    if (commute.status !== CommuteStatus.OPEN) {
      throw new BadRequestException('This commute is not open for joining');
    }

    if (commute.expiresAt && commute.expiresAt <= new Date()) {
      throw new BadRequestException('This commute is closed for new requests');
    }

    if (commute.creator.id === user.id) {
      throw new BadRequestException('You cannot join your own commute');
    }

    const existingParticipation = await this.participationRepository.findOne({
      where: {
        user: { id: user.id },
        commute: { id: commuteId },
      },
    });

    if (existingParticipation) {
      if (existingParticipation.status === ParticipationStatus.PENDING) {
        throw new BadRequestException(
          'You already requested to join this commute',
        );
      }

      if (existingParticipation.status === ParticipationStatus.ACCEPTED) {
        throw new BadRequestException(
          'You are already accepted for this commute',
        );
      }

      existingParticipation.status = ParticipationStatus.PENDING;
      const savedParticipation =
        await this.participationRepository.save(existingParticipation);

      await this.notificationService.createJoinRequestNotification(
        user,
        commute,
      );

      return savedParticipation;
    }

    const participation = this.participationRepository.create({
      user,
      commute,
      status: ParticipationStatus.PENDING,
    });

    const savedParticipation =
      await this.participationRepository.save(participation);

    await this.notificationService.createJoinRequestNotification(user, commute);

    return savedParticipation;
  }

  async updateJoinRequest(
    commuteId: number,
    userId: number,
    status: ParticipationStatus,
    currentUser: User,
  ) {
    if (
      status !== ParticipationStatus.ACCEPTED &&
      status !== ParticipationStatus.REJECTED
    ) {
      throw new BadRequestException('Status must be ACCEPTED or REJECTED');
    }

    const commute = await this.commuteRepository.findOne({
      where: { id: commuteId },
    });

    if (!commute) {
      throw new NotFoundException('Commute not found');
    }

    const isCreator = commute.creator.id === currentUser.id;
    const isAdmin = currentUser.role === UserRole.ADMIN;

    if (!isCreator && !isAdmin) {
      throw new ForbiddenException(
        'You are not allowed to manage this request',
      );
    }

    const participation = await this.participationRepository.findOne({
      where: {
        user: { id: userId },
        commute: { id: commuteId },
      },
    });

    if (!participation) {
      throw new NotFoundException('Join request not found');
    }

    if (status === ParticipationStatus.ACCEPTED) {
      const acceptedCount = await this.participationRepository.count({
        where: {
          commute: { id: commuteId },
          status: ParticipationStatus.ACCEPTED,
        },
      });

      if (acceptedCount >= commute.seats) {
        throw new BadRequestException('No seats available for this commute');
      }
    }

    participation.status = status;

    const updatedParticipation =
      await this.participationRepository.save(participation);

    await this.notificationService.createRequestDecisionNotification(
      participation.user,
      commute,
      status === ParticipationStatus.ACCEPTED
        ? NotificationType.REQUEST_ACCEPTED
        : NotificationType.REQUEST_REJECTED,
    );

    if (status === ParticipationStatus.ACCEPTED) {
      const acceptedCount = await this.participationRepository.count({
        where: {
          commute: { id: commuteId },
          status: ParticipationStatus.ACCEPTED,
        },
      });

      if (acceptedCount >= commute.seats) {
        commute.status = CommuteStatus.CLOSED;
        await this.commuteRepository.save(commute);
      }
    }

    return updatedParticipation;
  }

  async findAcceptedParticipants(commuteId: number, currentUser: User) {
    const commute = await this.commuteRepository.findOne({
      where: { id: commuteId },
    });

    if (!commute) {
      throw new NotFoundException('Commute not found');
    }

    const isCreator = commute.creator.id === currentUser.id;
    const isAdmin = currentUser.role === UserRole.ADMIN;
    const acceptedParticipation = await this.participationRepository.findOne({
      where: {
        user: { id: currentUser.id },
        commute: { id: commuteId },
        status: ParticipationStatus.ACCEPTED,
      },
    });

    if (!isCreator && !isAdmin && !acceptedParticipation) {
      throw new ForbiddenException(
        'You are not allowed to view these participants',
      );
    }

    return this.participationRepository.find({
      where: {
        commute: { id: commuteId },
        status: ParticipationStatus.ACCEPTED,
      },
      order: {
        updatedAt: 'ASC',
      },
    });
  }

  async updateMyCommuteLocation(
    commuteId: number,
    user: User,
    updateLocationDto: UpdateLocationDto,
  ) {
    const participation = await this.participationRepository.findOne({
      where: {
        user: { id: user.id },
        commute: { id: commuteId },
        status: ParticipationStatus.ACCEPTED,
      },
    });

    if (!participation) {
      throw new ForbiddenException(
        'Only accepted members can share live location for this commute',
      );
    }

    participation.currentLatitude = updateLocationDto.latitude;
    participation.currentLongitude = updateLocationDto.longitude;
    participation.locationUpdatedAt = new Date();

    return this.participationRepository.save(participation);
  }

  async leaveCommute(commuteId: number, user: User) {
    const participation = await this.participationRepository.findOne({
      where: {
        user: { id: user.id },
        commute: { id: commuteId },
      },
    });

    if (!participation) {
      throw new NotFoundException('Participation not found');
    }

    participation.status = ParticipationStatus.CANCELLED;

    return this.participationRepository.save(participation);
  }

  async findCommuteRequests(commuteId: number, currentUser: User) {
    const commute = await this.commuteRepository.findOne({
      where: { id: commuteId },
    });

    if (!commute) {
      throw new NotFoundException('Commute not found');
    }

    const isCreator = commute.creator.id === currentUser.id;
    const isAdmin = currentUser.role === UserRole.ADMIN;

    if (!isCreator && !isAdmin) {
      throw new ForbiddenException(
        'You are not allowed to view these requests',
      );
    }

    return this.participationRepository.find({
      where: {
        commute: { id: commuteId },
        status: ParticipationStatus.PENDING,
      },
      order: {
        joinedAt: 'ASC',
      },
    });
  }

  async findMyParticipations(userId: number) {
    return this.participationRepository.find({
      where: {
        user: { id: userId },
      },
      order: {
        joinedAt: 'DESC',
      },
    });
  }

  async deleteMyHistoryParticipation(participationId: number, user: User) {
    const participation = await this.participationRepository.findOne({
      where: {
        id: participationId,
        user: { id: user.id },
      },
    });

    if (!participation) {
      throw new NotFoundException('Participation not found');
    }

    const isHistory =
      participation.status === ParticipationStatus.REJECTED ||
      participation.status === ParticipationStatus.CANCELLED ||
      participation.commute.status === CommuteStatus.CLOSED ||
      participation.commute.status === CommuteStatus.COMPLETED;

    if (!isHistory) {
      throw new BadRequestException(
        'Only history participation records can be deleted',
      );
    }

    await this.participationRepository.remove(participation);

    return {
      message: 'Participation history deleted successfully',
    };
  }
}
