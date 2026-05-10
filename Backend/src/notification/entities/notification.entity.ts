import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Commute } from '../../commute/entities/commute.entity';
import { User } from '../../user/entities/user.entity';

export enum NotificationType {
  JOIN_REQUEST = 'JOIN_REQUEST',
  REQUEST_ACCEPTED = 'REQUEST_ACCEPTED',
  REQUEST_REJECTED = 'REQUEST_REJECTED',
}

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, {
    eager: true,
    onDelete: 'CASCADE',
  })
  user: User;

  @ManyToOne(() => Commute, {
    eager: true,
    onDelete: 'CASCADE',
  })
  commute: Commute;

  @Column({
    type: 'enum',
    enum: NotificationType,
  })
  type: NotificationType;

  @Column()
  message: string;

  @Column({ default: false })
  isRead: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
