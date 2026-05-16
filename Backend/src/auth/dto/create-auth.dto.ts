import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { UserGender } from '../../user/entities/user.entity';

export class CreateAuthDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString({ message: 'Full name must be text' })
  @MinLength(3, { message: 'Full name must be at least 3 characters' })
  @MaxLength(80, { message: 'Full name cannot be longer than 80 characters' })
  fullName: string;

  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString({ message: 'University ID must be text' })
  @Matches(/^\d{2}-\d{5}-\d$/, {
    message: 'University ID must be in valid format, for example 22-49155-3',
  })
  aiubId: string;

  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail({}, { message: 'Enter a valid email address' })
  @MaxLength(120, { message: 'Email cannot be longer than 120 characters' })
  email: string;

  @IsEnum(UserGender, { message: 'Gender must be MALE or FEMALE' })
  gender: UserGender;

  @IsString({ message: 'Password must be text' })
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  @MaxLength(20, { message: 'Password cannot be longer than 20 characters' })
  password: string;

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
