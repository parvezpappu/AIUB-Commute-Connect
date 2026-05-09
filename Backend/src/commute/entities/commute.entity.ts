import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';

export enum TransportType {
  BIKE = 'BIKE',
  CNG = 'CNG',
  RICKSHAW = 'RICKSHAW',
  WALKING = 'WALKING',
}

export enum CommuteStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
  CANCELLED = 'CANCELLED',
}

@Entity('commutes')
export class Commute {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: TransportType,
  })
  transportType: TransportType;

  @Column()
  fromLocation: string;

  @Column()
  toLocation: string;

  @Column()
  departureTime: Date;

  @Column()
  seats: number;

  @Column()
  costPerPerson: number;

  @Column({
    type: 'enum',
    enum: CommuteStatus,
    default: CommuteStatus.OPEN,
  })
  status: CommuteStatus;

  @ManyToOne(() => User, (user) => user.commutes, {
    eager: true,
    onDelete: 'CASCADE',
  })
  creator: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
