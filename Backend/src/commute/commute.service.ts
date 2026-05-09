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

@Injectable()
export class CommuteService {
  constructor(
    @InjectRepository(Commute)
    private readonly commuteRepository: Repository<Commute>,
  ) {}

  async create(createCommuteDto: CreateCommuteDto, creator: User) {
    const commute = this.commuteRepository.create({
      ...createCommuteDto,
      departureTime: new Date(createCommuteDto.departureTime),
      creator,
      status: CommuteStatus.OPEN,
    });

    return this.commuteRepository.save(commute);
  }

  async findAll() {
    return this.commuteRepository.find({
      where: {
        status: CommuteStatus.OPEN,
      },
      order: {
        departureTime: 'ASC',
      },
    });
  }

  async findMyCommutes(userId: number) {
    return this.commuteRepository.find({
      where: {
        creator: {
          id: userId,
        },
      },
      order: {
        departureTime: 'ASC',
      },
    });
  }

  async findOne(id: number) {
    const commute = await this.commuteRepository.findOne({
      where: { id },
    });

    if (!commute) {
      throw new NotFoundException('Commute not found');
    }

    return commute;
  }

  async close(id: number, user: User) {
    const commute = await this.findOne(id);

    const isCreator = commute.creator.id === user.id;
    const isAdmin = user.role === UserRole.ADMIN;

    if (!isCreator && !isAdmin) {
      throw new ForbiddenException('You are not allowed to close this commute');
    }

    commute.status = CommuteStatus.CLOSED;

    return this.commuteRepository.save(commute);
  }
}
