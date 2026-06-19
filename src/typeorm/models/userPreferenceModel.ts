import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('user_preferences')
@Unique('uq_user_preferences_user_type_channel', [
  'userId',
  'notificationType',
  'channel',
])
@Index('idx_user_preferences_user_id', ['userId'])
export class UserPreferenceModel {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id', type: 'varchar', length: 128 })
  userId!: string;

  @Column({ name: 'notification_type', type: 'varchar', length: 64 })
  notificationType!: string;

  @Column({ type: 'varchar', length: 64 })
  channel!: string;

  @Column({ type: 'boolean' })
  enabled!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}