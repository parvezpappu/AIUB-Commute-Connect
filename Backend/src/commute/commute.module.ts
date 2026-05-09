import { Module } from '@nestjs/common';
import { CommuteService } from './commute.service';
import { CommuteController } from './commute.controller';

@Module({
  controllers: [CommuteController],
  providers: [CommuteService],
})
export class CommuteModule {}
