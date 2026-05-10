import { IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class LoginAuthDto {
  @IsString()
  @Matches(/^\d{2}-\d{5}-\d$/, {
    message: 'University ID must be in valid format, for example 22-49155-3',
  })
  aiubId: string;

  @IsString()
  @MinLength(6)
  @MaxLength(20)
  password: string;
}
