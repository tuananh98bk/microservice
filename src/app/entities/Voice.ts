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

  @Column('int', { name: 'member_id', unsigned: true, nullable: true })
  memberId: number;

  @Column('varchar', { name: 'path', length: 255, comment: "user's email or phone " })
  path: string;

  @Column('varchar', { name: 'name', length: 20 })
  name: string;

  @Column('text', { name: 'transcription' })
  transcription: string;

  @Column('text', { name: 'transcription_detail' })
  transcriptionDetail: string;

  @Column('tinyint', {
    name: 'status',
    comment: '1: Active, 2: Inactive',
    default: CommonStatus.ACTIVE,
  })
  status: number;

  @CreateDateColumn({ type: 'timestamp', name: 'created_date', nullable: true })
  createdDate: Date | null;

  @UpdateDateColumn({ type: 'timestamp', name: 'modified_date', nullable: true })
  modifiedDate: Date | null;
}
