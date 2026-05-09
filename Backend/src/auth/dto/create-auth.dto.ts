import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { UserRole } from '../../user/entities/user.entity';

export class CreateAuthDto {
  @IsString()
  @MinLength(3)
  fullName: string;

  @IsString()
  @Matches(/^\d{2}-\d{5}-\d$/, {
    message: 'AIUB ID must be in valid format, for example 22-49155-3',
  })
  aiubId: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  @MaxLength(20)
  password: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}
