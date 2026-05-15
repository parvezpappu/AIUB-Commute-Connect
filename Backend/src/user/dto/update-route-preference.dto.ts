import { Transform } from 'class-transformer';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateRoutePreferenceDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsOptional()
  @IsString({ message: 'Preferred from location must be text' })
  @MaxLength(120, {
    message: 'Preferred from location cannot be longer than 120 characters',
  })
  preferredFromLocation?: string;

  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsOptional()
  @IsString({ message: 'Preferred to location must be text' })
  @MaxLength(120, {
    message: 'Preferred to location cannot be longer than 120 characters',
  })
  preferredToLocation?: string;
}
