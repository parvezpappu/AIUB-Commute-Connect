import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Commute } from '../../commute/entities/commute.entity';

export enum UserRole {
  STUDENT = 'STUDENT',
  ADMIN = 'ADMIN',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  fullName: string;

  @Column({ unique: true })
  aiubId: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  password: string;


  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.STUDENT,
  })
  role: UserRole;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ type: 'varchar', nullable: true })
  profilePictureUrl: string | null;

  @Column({ type: 'varchar', nullable: true })
  preferredFromLocation: string | null;

  @Column({ type: 'varchar', nullable: true })
  preferredToLocation: string | null;

  @Column({ type: 'varchar', nullable: true, select: false })
  emailVerificationOtp: string | null;

  @Column({ type: 'timestamp', nullable: true })
  emailVerificationOtpExpiresAt: Date | null;

  @Column({ type: 'varchar', nullable: true, select: false })
  passwordResetOtp: string | null;

  @Column({ type: 'timestamp', nullable: true })
  passwordResetOtpExpiresAt: Date | null;

  @OneToMany(() => Commute, (commute) => commute.creator)
  commutes: Commute[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
