import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsString,
  Length,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class ResetPasswordDto {
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail({}, { message: 'Enter a valid email address' })
  email: string;

  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString({ message: 'OTP must be text' })
  @Length(6, 6, { message: 'OTP must be exactly 6 digits' })
  @Matches(/^\d{6}$/, { message: 'OTP must contain only digits' })
  otp: string;

  @IsString({ message: 'New password must be text' })
  @MinLength(6, { message: 'New password must be at least 6 characters' })
  @MaxLength(20, { message: 'New password cannot be longer than 20 characters' })
  newPassword: string;

  @IsString({ message: 'Password confirmation must be text' })
  confirmPassword: string;
}
