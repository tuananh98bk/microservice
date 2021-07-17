import { MemberStatus } from '$enums';
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
@Entity('member')
export default class Member {
  @PrimaryGeneratedColumn({ name: 'id', type: 'int', unsigned: true })
  id: number;

  @Column({ name: 'email', type: 'varchar', length: 100, unique: true })
  email: string;

  @Column({ name: 'password', type: 'text' })
  password: string;

  @Column({ name: 'full_name', type: 'varchar', length: 255, nullable: true })
  fullName: string | null;

  @Column({ name: 'mobile', type: 'varchar', length: 20, nullable: true })
  mobile: string | null;

  @Column({ name: 'avatar', type: 'varchar', length: 255, nullable: true })
  avatar: string | null;

  @Column({ name: 'status', type: 'tinyint', default: MemberStatus.ACTIVE, comment: '0: Inactive, 1: Active.' })
  status: number;

  @CreateDateColumn({ name: 'created_date', type: 'datetime', nullable: true })
  createdDate: Date;

  @Column({ name: 'last_logged', type: 'datetime', nullable: true })
  lastLogged: Date | null;

  @Column({ name: 'last_change_pass', type: 'datetime', nullable: true })
  lastChangePass: Date | null;

  @UpdateDateColumn({ name: 'modified_date', type: 'datetime', nullable: true })
  modifiedDate: Date | null;

  @Column({ name: 'refresh_token', type: 'text', nullable: true })
  refreshToken: string | null;
}
