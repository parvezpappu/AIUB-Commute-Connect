import { IsString, MaxLength, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @IsString({ message: 'Current password must be text' })
  currentPassword: string;

  @IsString({ message: 'New password must be text' })
  @MinLength(6, { message: 'New password must be at least 6 characters' })
  @MaxLength(20, {
    message: 'New password cannot be longer than 20 characters',
  })
  newPassword: string;

  @IsString({ message: 'Password confirmation must be text' })
  confirmPassword: string;
}
