import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ParticipationService } from './participation.service';
import { ParticipationController } from './participation.controller';
import { Participation } from './entities/participation.entity';
import { Commute } from '../commute/entities/commute.entity';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [TypeOrmModule.forFeature([Participation, Commute]), NotificationModule],
  controllers: [ParticipationController],
  providers: [ParticipationService],
})
export class ParticipationModule {}
