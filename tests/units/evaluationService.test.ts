import { describe, expect, it } from 'vitest';
import { EvaluationService } from '../../src/application/services/evaluationService';

function createServiceMock(input?: {
  userPreferences?: any[];
  quietHours?: any | null;
  globalPolicy?: any | null;
}) {
  const preferencesRepository = {
    findUserPreferences: async () => input?.userPreferences ?? [],
    findQuietHours: async () => input?.quietHours ?? null,
  };

  const policiesRepository = {
    findBlockingPolicy: async () => input?.globalPolicy ?? null,
  };

  return new EvaluationService(
    preferencesRepository as any,
    policiesRepository as any,
  );
}

describe('EvaluationService', () => {
  it('denies when global policy blocks notification', async () => {
    const service = createServiceMock({
      globalPolicy: {
        id: 'policy-1',
        notificationType: 'marketing',
        channel: 'sms',
        region: 'EU',
        enabled: true,
        reason: 'blocked_by_global_policy',
      },
    });

    const result = await service.evaluate({
      userId: 'user-1',
      notificationType: 'marketing',
      channel: 'sms',
      region: 'EU',
      datetime: '2026-05-21T12:00:00Z',
    });

    expect(result).toEqual({
      decision: 'deny',
      reason: 'blocked_by_global_policy',
    });
  });

  it('denies marketing push during quiet hours', async () => {
    const service = createServiceMock({
      quietHours: {
        userId: 'user-1',
        enabled: true,
        start: '22:00',
        end: '08:00',
        timezone: 'Asia/Almaty',
      },
    });

    const result = await service.evaluate({
      userId: 'user-1',
      notificationType: 'marketing',
      channel: 'push',
      region: 'KZ',
      datetime: '2026-05-21T21:30:00Z',
    });

    expect(result).toEqual({
      decision: 'deny',
      reason: 'blocked_by_quiet_hours',
    });
  });

  it('allows when user preference enables notification', async () => {
    const service = createServiceMock({
      userPreferences: [
        {
          userId: 'user-1',
          notificationType: 'marketing',
          channel: 'email',
          enabled: true,
        },
      ],
    });

    const result = await service.evaluate({
      userId: 'user-1',
      notificationType: 'marketing',
      channel: 'email',
      region: 'US',
      datetime: '2026-05-21T12:00:00Z',
    });

    expect(result).toEqual({
      decision: 'allow',
      reason: 'allowed_by_user_preference',
    });
  });

  it('denies when user preference disables notification', async () => {
    const service = createServiceMock({
      userPreferences: [
        {
          userId: 'user-1',
          notificationType: 'marketing',
          channel: 'push',
          enabled: false,
        },
      ],
    });

    const result = await service.evaluate({
      userId: 'user-1',
      notificationType: 'marketing',
      channel: 'push',
      region: 'US',
      datetime: '2026-05-21T12:00:00Z',
    });

    expect(result).toEqual({
      decision: 'deny',
      reason: 'disabled_by_user_preference',
    });
  });

  it('uses default preference when user preference is absent', async () => {
    const service = createServiceMock();

    const result = await service.evaluate({
      userId: 'new-user',
      notificationType: 'transactional',
      channel: 'email',
      region: 'US',
      datetime: '2026-05-21T12:00:00Z',
    });

    expect(result).toEqual({
      decision: 'allow',
      reason: 'allowed_by_default',
    });
  });
});