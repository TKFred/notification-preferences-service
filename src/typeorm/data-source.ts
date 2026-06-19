import 'reflect-metadata';
import dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import { UserPreferenceModel } from './models/userPreferenceModel';
import { UserQuietHoursModel } from './models/userQuietHoursModel';
import { GlobalPolicyModel } from './models/globalPolicyModel';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  synchronize: false,
  logging: false,
  entities: [
    UserPreferenceModel,
    UserQuietHoursModel,
    GlobalPolicyModel,
  ],
  migrations: process.env.NODE_ENV === 'test'
    ? []
    : ['src/typeorm/migrations/*.ts'],
});