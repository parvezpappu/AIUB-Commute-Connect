import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('Registration_And_Login')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;
}
