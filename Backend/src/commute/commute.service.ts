import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCommuteDto } from './dto/create-commute.dto';
import { UpdateCreatorLocationDto } from './dto/update-creator-location.dto';
import { UpdateCommuteDto } from './dto/update-commute.dto';
import { Commute, CommuteStatus } from './entities/commute.entity';
import { User, UserRole } from '../user/entities/user.entity';
import {
  Participation,
  ParticipationStatus,
} from '../participation/entities/participation.entity';

@Injectable()
export class CommuteService {
  constructor(
    @InjectRepository(Commute)
    private readonly commuteRepository: Repository<Commute>,
    @InjectRepository(Participation)
    private readonly participationRepository: Repository<Participation>,
  ) {}

  async create(createCommuteDto: CreateCommuteDto, creator: User) {
    if (!creator.isVerified) {
      throw new ForbiddenException(
        'Please verify your email before creating a commute',
      );
    }

    const commute = this.commuteRepository.create({
      ...createCommuteDto,
      departureTime: new Date(createCommuteDto.departureTime),
      creator,
      status: CommuteStatus.OPEN,
    });

    return this.commuteRepository.save(commute);
  }

  async findAll() {
    const commutes = await this.commuteRepository.find({
      where: {
        status: CommuteStatus.OPEN,
      },
      order: {
        departureTime: 'ASC',
      },
    });

    return Promise.all(commutes.map((commute) => this.attachSeatInfo(commute)));
  }

  async findMyCommutes(userId: number) {
    const commutes = await this.commuteRepository.find({
      where: {
        creator: {
          id: userId,
        },
      },
      order: {
        departureTime: 'ASC',
      },
    });

    return Promise.all(commutes.map((commute) => this.attachSeatInfo(commute)));
  }

  async findOne(id: number) {
    const commute = await this.findCommuteEntity(id);

    return this.attachSeatInfo(commute);
  }

  async update(id: number, updateCommuteDto: UpdateCommuteDto, user: User) {
    const commute = await this.findCommuteEntity(id);

    this.ensureCanManage(commute, user, 'edit');

    if (commute.status !== CommuteStatus.OPEN) {
      throw new BadRequestException('Only open commute posts can be edited');
    }

    const acceptedSeats = await this.countAcceptedSeats(commute.id);

    if (
      updateCommuteDto.seats !== undefined &&
      updateCommuteDto.seats < acceptedSeats
    ) {
      throw new BadRequestException(
        'Seats cannot be less than accepted members',
      );
    }

    Object.assign(commute, {
      ...updateCommuteDto,
      departureTime: updateCommuteDto.departureTime
        ? new Date(updateCommuteDto.departureTime)
        : commute.departureTime,
    });

    const savedCommute = await this.commuteRepository.save(commute);
    return this.attachSeatInfo(savedCommute);
  }

  async close(id: number, user: User) {
    const commute = await this.findCommuteEntity(id);

    this.ensureCanManage(commute, user, 'close');

    commute.status = CommuteStatus.CLOSED;

    const savedCommute = await this.commuteRepository.save(commute);
    return this.attachSeatInfo(savedCommute);
  }

  async updateCreatorLocation(
    id: number,
    updateCreatorLocationDto: UpdateCreatorLocationDto,
    user: User,
  ) {
    const commute = await this.findCommuteEntity(id);

    if (commute.creator.id !== user.id) {
      throw new ForbiddenException(
        'Only the commute creator can share creator location',
      );
    }

    commute.creatorCurrentLatitude = updateCreatorLocationDto.latitude;
    commute.creatorCurrentLongitude = updateCreatorLocationDto.longitude;
    commute.creatorLocationUpdatedAt = new Date();

    const savedCommute = await this.commuteRepository.save(commute);
    return this.attachSeatInfo(savedCommute);
  }

  async cancel(id: number, user: User) {
    const commute = await this.findCommuteEntity(id);

    this.ensureCanManage(commute, user, 'cancel');

    await this.commuteRepository.remove(commute);

    return {
      message: 'Commute cancelled and deleted successfully',
    };
  }

  private async findCommuteEntity(id: number) {
    const commute = await this.commuteRepository.findOne({
      where: { id },
    });

    if (!commute) {
      throw new NotFoundException('Commute not found');
    }

    return commute;
  }

  private ensureCanManage(commute: Commute, user: User, action: string) {
    const isCreator = commute.creator.id === user.id;
    const isAdmin = user.role === UserRole.ADMIN;

    if (!isCreator && !isAdmin) {
      throw new ForbiddenException(
        `You are not allowed to ${action} this commute`,
      );
    }
  }

  private async attachSeatInfo(commute: Commute) {
    const acceptedSeats = await this.countAcceptedSeats(commute.id);

    return {
      ...commute,
      acceptedSeats,
      availableSeats: commute.seats - acceptedSeats,
    };
  }

  private countAcceptedSeats(commuteId: number) {
    return this.participationRepository.count({
      where: {
        commute: { id: commuteId },
        status: ParticipationStatus.ACCEPTED,
      },
    });
  }
}
