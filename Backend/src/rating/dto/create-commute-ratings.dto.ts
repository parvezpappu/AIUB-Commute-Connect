import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsInt,
  IsOptional,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export class CreateUserRatingDto {
  @Type(() => Number)
  @IsInt({ message: 'Rated user id must be a whole number' })
  ratedUserId: number;

  @Type(() => Number)
  @IsInt({ message: 'User rating must be a whole number' })
  @Min(1, { message: 'User rating must be at least 1' })
  @Max(5, { message: 'User rating cannot be more than 5' })
  rating: number;
}

export class CreateCommuteRatingsDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Overall rating must be a whole number' })
  @Min(1, { message: 'Overall rating must be at least 1' })
  @Max(5, { message: 'Overall rating cannot be more than 5' })
  overallRating?: number;

  @IsArray({ message: 'User ratings must be a list' })
  @ArrayMaxSize(20, { message: 'Too many user ratings submitted' })
  @ValidateNested({ each: true })
  @Type(() => CreateUserRatingDto)
  userRatings: CreateUserRatingDto[];
}
