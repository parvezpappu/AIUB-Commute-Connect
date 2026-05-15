import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

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
