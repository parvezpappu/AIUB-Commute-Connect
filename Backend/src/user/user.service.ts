import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateAuthDto } from '../auth/dto/create-auth.dto';
import { User, UserRole } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createAuthDto: CreateAuthDto) {
    const existingEmail = await this.findByEmail(createAuthDto.email);

    if (existingEmail) {
      throw new ConflictException('Email already exists');
    }

    const existingAiubId = await this.findByAiubId(createAuthDto.aiubId);

    if (existingAiubId) {
      throw new ConflictException('AIUB ID already exists');
    }

    const hashedPassword = await bcrypt.hash(createAuthDto.password, 10);

    const user = this.userRepository.create({
      ...createAuthDto,
      role: UserRole.STUDENT,
      password: hashedPassword,
      isVerified: false,
    });

    const savedUser = await this.userRepository.save(user);

    const { password, ...result } = savedUser;
    return result;
  }

  async createVerifiedUserWithHashedPassword(userData: {
    fullName: string;
    aiubId: string;
    email: string;
    password: string;
  }) {
    const user = this.userRepository.create({
      ...userData,
      role: UserRole.STUDENT,
      isVerified: true,
    });

    const savedUser = await this.userRepository.save(user);
    const { password, ...result } = savedUser;
    return result;
  }

  async findByEmail(email: string) {
    return this.userRepository.findOne({ where: { email } });
  }

  findAll() {
    return this.userRepository.find({
      order: {
        id: 'ASC',
      },
    });
  }

  async remove(id: number, currentUserId: number) {
    if (id === currentUserId) {
      throw new BadRequestException('You cannot delete your own admin account');
    }

    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.userRepository.remove(user);

    return {
      message: 'User deleted successfully',
    };
  }

 async findByAiubId(aiubId: string, includePassword = false) {
  const query = this.userRepository
    .createQueryBuilder('user')
    .where('user.aiubId = :aiubId', { aiubId });

  if (includePassword) {
    query.addSelect('user.password');
  }

  return query.getOne();
}

 async findByEmailForVerification(email: string) {
  return this.userRepository
    .createQueryBuilder('user')
    .addSelect('user.emailVerificationOtp')
    .where('user.email = :email', { email })
    .getOne();
}

 async save(user: User) {
  return this.userRepository.save(user);
}

}
