import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsISO8601,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';
import { TransportType } from '../entities/commute.entity';

export class CreateCommuteDto {
  @IsEnum(TransportType)
  transportType: TransportType;

  @IsString()
  @MinLength(2)
  fromLocation: string;

  @IsString()
  @MinLength(2)
  toLocation: string;

  @IsISO8601()
  departureTime: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(10)
  seats: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  costPerPerson: number;
}
