import { IsEnum } from 'class-validator';
import { ParticipationStatus } from '../entities/participation.entity';

export class UpdateParticipationDto {
  @IsEnum(ParticipationStatus, {
    message: 'Status must be PENDING, ACCEPTED, REJECTED, or CANCELLED',
  })
  status: ParticipationStatus;
}

