import { Transform, Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsISO8601,
  IsLatitude,
  IsLongitude,
  IsOptional,
  IsString,
  MaxLength,
  Max,
  Min,
  MinLength,
} from 'class-validator';
import {
  ParticipantGenderPreference,
  TransportType,
} from '../entities/commute.entity';

export class CreateCommuteDto {
  @IsEnum(TransportType, {
    message: 'Transport type must be UBER, BUS, BIKE, CNG, RICKSHAW, or WALKING',
  })
  transportType: TransportType;

  @IsEnum(ParticipantGenderPreference, {
    message: 'Participant gender preference must be MALE, FEMALE, or BOTH',
  })
  participantGenderPreference: ParticipantGenderPreference;

  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString({ message: 'From location must be text' })
  @MinLength(2, { message: 'From location must be at least 2 characters' })
  fromLocation: string;

  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString({ message: 'To location must be text' })
  @MinLength(2, { message: 'To location must be at least 2 characters' })
  toLocation: string;

  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString({ message: 'Meeting location must be text' })
  @MinLength(2, { message: 'Meeting location must be at least 2 characters' })
  meetingLocation: string;

  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsOptional()
  @IsString({ message: 'Meeting address must be text' })
  @MaxLength(500, { message: 'Meeting address cannot be longer than 500 characters' })
  meetingAddress?: string;

  @Type(() => Number)
  @IsLatitude({ message: 'Meeting latitude must be a valid latitude' })
  meetingLatitude: number;

  @Type(() => Number)
  @IsLongitude({ message: 'Meeting longitude must be a valid longitude' })
  meetingLongitude: number;

  @IsISO8601({}, { message: 'Departure time must be a valid date and time' })
  departureTime: string;

  @IsISO8601({}, { message: 'Request close time must be a valid date and time' })
  expiresAt: string;

  @Type(() => Number)
  @IsInt({ message: 'Seats must be a whole number' })
  @Min(1, { message: 'Seats must be at least 1' })
  @Max(10, { message: 'Seats cannot be more than 10' })
  seats: number;

  @Type(() => Number)
  @IsInt({ message: 'Cost per person must be a whole number' })
  @Min(0, { message: 'Cost per person cannot be negative' })
  costPerPerson: number;
}
