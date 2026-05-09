import { ConflictException, Injectable } from '@nestjs/common';
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

  async findByEmail(email: string) {
    return this.userRepository.findOne({ where: { email } });
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

}
