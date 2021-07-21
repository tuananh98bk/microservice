import { CommonStatus, VerifiedCodeStatus } from '$enums';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('voice')
export default class Voice {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'id' })
  id: number;

  @Column('varchar', { name: 'path', length: 255, comment: "user's email or phone " })
  path: string;

  @Column('varchar', { name: 'name', length: 20 })
  name: string;

  @Column('longblob', { name: 'data' })
    
  @Column('tinyint', {
    name: 'status',
    comment: '1: Active, 2: Inactive',
    default: CommonStatus.ACTIVE,
  })
  status: number;

  // @Column('timestamp', { name: 'verified_date', nullable: true })
  // verifiedDate: Date | null;

  @CreateDateColumn({ type: 'timestamp', name: 'created_date', nullable: true })
  createdDate: Date | null;

  @UpdateDateColumn({ type: 'timestamp', name: 'modified_date', nullable: true })
  modifiedDate: Date | null;
}
