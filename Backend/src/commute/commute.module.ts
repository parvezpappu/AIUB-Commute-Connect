import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommuteService } from './commute.service';
import { CommuteController } from './commute.controller';
import { Commute } from './entities/commute.entity';
import { Participation } from '../participation/entities/participation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Commute, Participation])],
  controllers: [CommuteController],
  providers: [CommuteService],
})
export class CommuteModule {}
