import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateAuthDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  @MaxLength(20)
  password: string;
}
