import { IsEmail, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class CreateAuthDto {
  @IsString()
  @MinLength(3)
  fullName: string;

  @IsString()
  @Matches(/^\d{2}-\d{5}-\d$/, {
    message: 'University ID must be in valid format, for example 22-49155-3',
  })
  aiubId: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  @MaxLength(20)
  password: string;
}
