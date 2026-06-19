import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

@Entity('global_policies')
@Unique('uq_global_policies_type_channel_region', [
  'notificationType',
  'channel',
  'region',
])
@Index('idx_global_policies_lookup', [
  'notificationType',
  'channel',
  'region',
])
export class GlobalPolicyModel {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'notification_type', type: 'varchar', length: 64 })
  notificationType!: string;

  @Column({ type: 'varchar', length: 64 })
  channel!: string;

  @Column({ type: 'varchar', length: 64 })
  region!: string;

  @Column({ type: 'boolean', default: true })
  enabled!: boolean;

  @Column({ type: 'varchar', length: 128 })
  reason!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}