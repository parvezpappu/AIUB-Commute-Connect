import { Type } from 'class-transformer';
import { IsLatitude, IsLongitude } from 'class-validator';

export class UpdateCreatorLocationDto {
  @Type(() => Number)
  @IsLatitude({ message: 'Latitude must be valid' })
  latitude: number;

  @Type(() => Number)
  @IsLongitude({ message: 'Longitude must be valid' })
  longitude: number;
}
