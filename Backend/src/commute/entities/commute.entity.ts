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
  UBER = 'UBER',
  BUS = 'BUS',
  BIKE = 'BIKE',
  CNG = 'CNG',
  RICKSHAW = 'RICKSHAW',
  WALKING = 'WALKING',
}

export enum CommuteStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
}

export enum ParticipantGenderPreference {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  BOTH = 'BOTH',
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

  @Column({ nullable: true })
  meetingLocation: string;

  @Column({ nullable: true })
  meetingAddress: string;

  @Column({ nullable: true, type: 'double precision' })
  meetingLatitude: number;

  @Column({ nullable: true, type: 'double precision' })
  meetingLongitude: number;

  @Column()
  departureTime: Date;

  @Column({ nullable: true, type: 'timestamp' })
  expiresAt: Date;

  @Column()
  seats: number;

  @Column()
  costPerPerson: number;

  @Column({ default: false })
  costToBeDecided: boolean;

  @Column({
    type: 'enum',
    enum: ParticipantGenderPreference,
    default: ParticipantGenderPreference.BOTH,
  })
  participantGenderPreference: ParticipantGenderPreference;

  @Column({
    type: 'enum',
    enum: CommuteStatus,
    default: CommuteStatus.OPEN,
  })
  status: CommuteStatus;

  @Column({ nullable: true, type: 'double precision' })
  creatorCurrentLatitude: number;

  @Column({ nullable: true, type: 'double precision' })
  creatorCurrentLongitude: number;

  @Column({ nullable: true, type: 'timestamp' })
  creatorLocationUpdatedAt: Date;

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
