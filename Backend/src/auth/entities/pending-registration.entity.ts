import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserGender } from '../../user/entities/user.entity';

@Entity('pending_registrations')
export class PendingRegistration {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  fullName: string;

  @Column({ unique: true })
  aiubId: string;

  @Column({ unique: true })
  email: string;

  @Column({
    type: 'enum',
    enum: UserGender,
    nullable: true,
  })
  gender: UserGender | null;

  @Column()
  password: string;

  @Column({ type: 'varchar', nullable: true })
  preferredFromLocation: string | null;

  @Column({ type: 'varchar', nullable: true })
  preferredToLocation: string | null;

  @Column({ type: 'varchar', select: false })
  emailVerificationOtp: string;

  @Column({ type: 'timestamp' })
  emailVerificationOtpExpiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
