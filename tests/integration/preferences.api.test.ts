import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { DataSource } from 'typeorm';
import { createApp } from '../../src/app';
import { AppDataSource } from '../../src/typeorm/data-source';

describe('Preferences API', () => {
  let dataSource: DataSource | undefined;
  let app: ReturnType<typeof createApp>;

  function getDataSource(): DataSource {
    if (!dataSource) {
      throw new Error('DataSource is not initialized');
    }

    return dataSource;
  }

  beforeAll(async () => {
    dataSource = AppDataSource.isInitialized
      ? AppDataSource
      : await AppDataSource.initialize();

    await getDataSource().query('DELETE FROM user_preferences');
    await getDataSource().query('DELETE FROM user_quiet_hours');
    await getDataSource().query('DELETE FROM global_policies');

    app = createApp({ dataSource: getDataSource() });
  });

  afterAll(async () => {
    if (dataSource?.isInitialized) {
      await dataSource.destroy();
    }
  });

  it('returns default preferences for a new user', async () => {
    const response = await request(app)
      .get('/users/new-user/preferences')
      .expect(200);

    expect(response.body.userId).toBe('new-user');
    expect(response.body.preferences.length).toBeGreaterThan(0);

    expect(response.body.preferences).toContainEqual({
      notificationType: 'marketing',
      channel: 'email',
      enabled: false,
      source: 'default',
    });
  });

  it('updates user preferences idempotently', async () => {
    const body = {
      preferences: [
        {
          notificationType: 'marketing',
          channel: 'email',
          enabled: true,
        },
      ],
      quietHours: {
        enabled: true,
        start: '22:00',
        end: '08:00',
        timezone: 'Asia/Almaty',
      },
    };

    await request(app)
      .post('/users/user-1/preferences')
      .send(body)
      .expect(200);

    await request(app)
      .post('/users/user-1/preferences')
      .send(body)
      .expect(200);

    const response = await request(app)
      .get('/users/user-1/preferences')
      .expect(200);

    expect(response.body.preferences).toContainEqual({
      notificationType: 'marketing',
      channel: 'email',
      enabled: true,
      source: 'user',
    });

    expect(response.body.quietHours).toMatchObject({
      userId: 'user-1',
      enabled: true,
      timezone: 'Asia/Almaty',
    });

    const rows = await getDataSource().query(
      `SELECT * FROM user_preferences WHERE user_id = $1`,
      ['user-1'],
    );

    expect(rows).toHaveLength(1);
  });

  it('returns validation error for invalid preference update', async () => {
    const response = await request(app)
      .post('/users/user-1/preferences')
      .send({
        preferences: [
          {
            notificationType: 'wrong',
            channel: 'email',
            enabled: false,
          },
        ],
      })
      .expect(400);

    expect(response.body.error).toBe('validation_error');
  });
});