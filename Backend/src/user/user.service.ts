import { Injectable } from '@nestjs/common';
import { CreateAuthDto } from '../auth/dto/create-auth.dto';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(@InjectRepository(User) private Repository: Repository<User>) {}

  async create(createAuthDto: CreateAuthDto) {
    const pasword = createAuthDto.password;
    const hashedPassword = bcrypt.hashSync(pasword, 10);
    createAuthDto.password = hashedPassword;
    const user = this.Repository.create(createAuthDto);
    return this.Repository.save(user);
  }

  async findByEmail(email: string) {
    return await this.Repository.findOne({ where: { email } });
  }
}
