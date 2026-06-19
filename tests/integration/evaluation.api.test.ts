import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { DataSource } from 'typeorm';
import { createApp } from '../../src/app';
import { AppDataSource } from '../../src/typeorm/data-source';
import { GlobalPolicyModel } from '../../src/typeorm/models/globalPolicyModel';

describe('Evaluation API', () => {
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

  it('uses default preference when user has no override', async () => {
    const response = await request(app)
      .post('/evaluate')
      .send({
        userId: 'new-user',
        notificationType: 'transactional',
        channel: 'email',
        region: 'US',
        datetime: '2026-05-21T12:00:00Z',
      })
      .expect(200);

    expect(response.body).toEqual({
      decision: 'allow',
      reason: 'allowed_by_default',
    });
  });

  it('uses user preference override', async () => {
    await request(app)
      .post('/users/user-1/preferences')
      .send({
        preferences: [
          {
            notificationType: 'marketing',
            channel: 'email',
            enabled: true,
          },
        ],
      })
      .expect(200);

    const response = await request(app)
      .post('/evaluate')
      .send({
        userId: 'user-1',
        notificationType: 'marketing',
        channel: 'email',
        region: 'US',
        datetime: '2026-05-21T12:00:00Z',
      })
      .expect(200);

    expect(response.body).toEqual({
      decision: 'allow',
      reason: 'allowed_by_user_preference',
    });
  });

  it('denies when user preference disables notification', async () => {
    await request(app)
      .post('/users/user-disabled/preferences')
      .send({
        preferences: [
          {
            notificationType: 'marketing',
            channel: 'push',
            enabled: false,
          },
        ],
      })
      .expect(200);

    const response = await request(app)
      .post('/evaluate')
      .send({
        userId: 'user-disabled',
        notificationType: 'marketing',
        channel: 'push',
        region: 'US',
        datetime: '2026-05-21T12:00:00Z',
      })
      .expect(200);

    expect(response.body).toEqual({
      decision: 'deny',
      reason: 'disabled_by_user_preference',
    });
  });

  it('blocks by quiet hours', async () => {
    await request(app)
      .post('/users/user-quiet/preferences')
      .send({
        quietHours: {
          enabled: true,
          start: '22:00',
          end: '08:00',
          timezone: 'Asia/Almaty',
        },
      })
      .expect(200);

    const response = await request(app)
      .post('/evaluate')
      .send({
        userId: 'user-quiet',
        notificationType: 'marketing',
        channel: 'push',
        region: 'KZ',
        datetime: '2026-05-21T21:30:00Z',
      })
      .expect(200);

    expect(response.body).toEqual({
      decision: 'deny',
      reason: 'blocked_by_quiet_hours',
    });
  });

  it('allows transactional notification during quiet hours', async () => {
    await request(app)
      .post('/users/user-quiet-transactional/preferences')
      .send({
        quietHours: {
          enabled: true,
          start: '22:00',
          end: '08:00',
          timezone: 'Asia/Almaty',
        },
      })
      .expect(200);

    const response = await request(app)
      .post('/evaluate')
      .send({
        userId: 'user-quiet-transactional',
        notificationType: 'transactional',
        channel: 'push',
        region: 'KZ',
        datetime: '2026-05-21T21:30:00Z',
      })
      .expect(200);

    expect(response.body).toEqual({
      decision: 'allow',
      reason: 'allowed_by_default',
    });
  });

  it('blocks by global policy', async () => {
    await getDataSource().getRepository(GlobalPolicyModel).upsert(
      {
        notificationType: 'marketing',
        channel: 'sms',
        region: 'EU',
        enabled: true,
        reason: 'blocked_by_global_policy',
      },
      ['notificationType', 'channel', 'region'],
    );

    const response = await request(app)
      .post('/evaluate')
      .send({
        userId: 'user-1',
        notificationType: 'marketing',
        channel: 'sms',
        region: 'EU',
        datetime: '2026-05-21T12:00:00Z',
      })
      .expect(200);

    expect(response.body).toEqual({
      decision: 'deny',
      reason: 'blocked_by_global_policy',
    });
  });

  it('global policy has priority over user preference allow', async () => {
    await request(app)
      .post('/users/user-policy/preferences')
      .send({
        preferences: [
          {
            notificationType: 'marketing',
            channel: 'sms',
            enabled: true,
          },
        ],
      })
      .expect(200);

    await getDataSource().getRepository(GlobalPolicyModel).upsert(
      {
        notificationType: 'marketing',
        channel: 'sms',
        region: 'EU',
        enabled: true,
        reason: 'blocked_by_global_policy',
      },
      ['notificationType', 'channel', 'region'],
    );

    const response = await request(app)
      .post('/evaluate')
      .send({
        userId: 'user-policy',
        notificationType: 'marketing',
        channel: 'sms',
        region: 'EU',
        datetime: '2026-05-21T12:00:00Z',
      })
      .expect(200);

    expect(response.body).toEqual({
      decision: 'deny',
      reason: 'blocked_by_global_policy',
    });
  });

  it('returns validation error for invalid evaluate request', async () => {
    const response = await request(app)
      .post('/evaluate')
      .send({
        userId: 'user-1',
        notificationType: 'marketing',
        channel: 'whatsapp',
        region: 'EU',
        datetime: '2026-05-21T12:00:00Z',
      })
      .expect(400);

    expect(response.body.error).toBe('validation_error');
  });
});