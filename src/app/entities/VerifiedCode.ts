import { VerifiedCodeStatus } from '$enums';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('verified_code')
export default class VerifiedCode {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'id' })
  id: number;

  @Column('varchar', { name: 'target', length: 255, comment: "user's email or phone " })
  target: string;

  @Column('varchar', { name: 'code', length: 20 })
  code: string;

  @Column('tinyint', {
    name: 'status',
    comment: '1: unused, 2: used',
    default: VerifiedCodeStatus.UNUSED,
  })
  status: number;

  @Column('timestamp', { name: 'verified_date', nullable: true })
  verifiedDate: Date | null;

  @Column('timestamp', { name: 'expired_date', nullable: true })
  expiredDate: Date | null;

  @CreateDateColumn({ type: 'timestamp', name: 'created_date', nullable: true })
  createdDate: Date | null;

  @UpdateDateColumn({ type: 'timestamp', name: 'modified_date', nullable: true })
  modifiedDate: Date | null;
}
