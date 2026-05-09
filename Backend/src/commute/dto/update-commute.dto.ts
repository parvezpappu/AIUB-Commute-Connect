import { PartialType } from '@nestjs/mapped-types';
import { CreateCommuteDto } from './create-commute.dto';

export class UpdateCommuteDto extends PartialType(CreateCommuteDto) {}
