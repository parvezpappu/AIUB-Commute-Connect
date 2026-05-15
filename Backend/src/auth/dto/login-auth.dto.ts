import { Transform } from 'class-transformer';
import { IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class LoginAuthDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString({ message: 'University ID must be text' })
  @Matches(/^\d{2}-\d{5}-\d$/, {
    message: 'University ID must be in valid format, for example 22-49155-3',
  })
  aiubId: string;

  @IsString({ message: 'Password must be text' })
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  @MaxLength(20, { message: 'Password cannot be longer than 20 characters' })
  password: string;
}
