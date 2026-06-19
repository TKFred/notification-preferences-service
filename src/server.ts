import 'reflect-metadata';
import dotenv from 'dotenv';
import { createApp } from './app';
import { AppDataSource } from './typeorm/data-source';

dotenv.config();

const port = Number(process.env.PORT ?? 3000);

async function bootstrap() {
  await AppDataSource.initialize();

  const app = createApp({
    dataSource: AppDataSource,
  });

  app.listen(port, () => {
    console.log(`Notification Preferences Service is running on port ${port}`);
  });
}

bootstrap().catch((error) => {
  console.error('Failed to start application', error);
  process.exit(1);
});