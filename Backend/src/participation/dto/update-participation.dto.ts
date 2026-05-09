import { IsEnum } from 'class-validator';
import { ParticipationStatus } from '../entities/participation.entity';

export class UpdateParticipationDto {
  @IsEnum(ParticipationStatus)
  status: ParticipationStatus;
}

