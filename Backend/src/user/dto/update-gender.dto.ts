import { IsEnum } from 'class-validator';
import { UserGender } from '../entities/user.entity';

export class UpdateGenderDto {
  @IsEnum(UserGender, { message: 'Gender must be MALE or FEMALE' })
  gender: UserGender;
}
