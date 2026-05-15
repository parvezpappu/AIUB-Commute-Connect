import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommuteService } from './commute.service';
import { CommuteController } from './commute.controller';
import { Commute } from './entities/commute.entity';
import { Participation } from '../participation/entities/participation.entity';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [TypeOrmModule.forFeature([Commute, Participation]), NotificationModule],
  controllers: [CommuteController],
  providers: [CommuteService],
})
export class CommuteModule {}
