import 'reflect-metadata';
import { AppDataSource } from '../data-source';
import { GlobalPolicyModel } from '../models/globalPolicyModel';

async function seed() {
  await AppDataSource.initialize();

  await AppDataSource.getRepository(GlobalPolicyModel).upsert(
    {
      notificationType: 'marketing',
      channel: 'sms',
      region: 'EU',
      enabled: true,
      reason: 'blocked_by_global_policy',
    },
    ['notificationType', 'channel', 'region'],
  );

  await AppDataSource.destroy();

  console.log('Seed completed');
}

seed().catch(async (error) => {
  console.error(error);

  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
  }

  process.exit(1);
});