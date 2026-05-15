import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Commute } from '../../commute/entities/commute.entity';
import { User } from '../../user/entities/user.entity';

export enum RatingType {
  USER = 'USER',
  TRIP = 'TRIP',
}

@Entity('commute_ratings')
export class CommuteRating {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Commute, {
    eager: true,
    onDelete: 'CASCADE',
  })
  commute: Commute;

  @ManyToOne(() => User, {
    eager: true,
    onDelete: 'CASCADE',
  })
  rater: User;

  @ManyToOne(() => User, {
    eager: true,
    nullable: true,
    onDelete: 'CASCADE',
  })
  ratedUser: User | null;

  @Column({
    type: 'enum',
    enum: RatingType,
  })
  type: RatingType;

  @Column()
  rating: number;

  @CreateDateColumn()
  createdAt: Date;
}
