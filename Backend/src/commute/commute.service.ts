import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCommuteDto } from './dto/create-commute.dto';
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

  async close(id: number, user: User) {
    const commute = await this.findCommuteEntity(id);

    this.ensureCanManage(commute, user, 'close');

    commute.status = CommuteStatus.CLOSED;

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
    const acceptedSeats = await this.participationRepository.count({
      where: {
        commute: { id: commute.id },
        status: ParticipationStatus.ACCEPTED,
      },
    });

    return {
      ...commute,
      acceptedSeats,
      availableSeats: commute.seats - acceptedSeats,
    };
  }
}
