import { IsEmail } from 'class-validator';

export class ResendVerificationOtpDto {
  @IsEmail()
  email: string;
}
