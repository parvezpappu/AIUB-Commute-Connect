import { Transform } from 'class-transformer';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateNameDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString({ message: 'Full name must be text' })
  @MinLength(3, { message: 'Full name must be at least 3 characters' })
  @MaxLength(80, { message: 'Full name cannot be longer than 80 characters' })
  fullName: string;
}
