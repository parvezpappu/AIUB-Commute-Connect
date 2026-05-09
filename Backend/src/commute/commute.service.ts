import { Injectable } from '@nestjs/common';
import { CreateCommuteDto } from './dto/create-commute.dto';
import { UpdateCommuteDto } from './dto/update-commute.dto';

@Injectable()
export class CommuteService {
  create(createCommuteDto: CreateCommuteDto) {
    return 'This action adds a new commute';
  }

  findAll() {
    return `This action returns all commute`;
  }

  findOne(id: number) {
    return `This action returns a #${id} commute`;
  }

  update(id: number, updateCommuteDto: UpdateCommuteDto) {
    return `This action updates a #${id} commute`;
  }

  remove(id: number) {
    return `This action removes a #${id} commute`;
  }
}
