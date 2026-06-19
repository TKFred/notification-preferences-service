import { describe, expect, it } from 'vitest';
import {
  isWithinQuietHours,
  shouldApplyQuietHours,
} from '../../src/application/services/quietHoursService';

describe('quietHoursService', () => {
  it('returns true when datetime is within quiet hours crossing midnight', () => {
    const result = isWithinQuietHours({
      datetime: '2026-05-21T21:30:00Z',
      quietHours: {
        userId: 'user-1',
        enabled: true,
        start: '22:00',
        end: '08:00',
        timezone: 'Asia/Almaty',
      },
    });

    expect(result).toBe(true);
  });

  it('returns false when datetime is outside quiet hours crossing midnight', () => {
    const result = isWithinQuietHours({
      datetime: '2026-05-21T08:00:00Z',
      quietHours: {
        userId: 'user-1',
        enabled: true,
        start: '22:00',
        end: '08:00',
        timezone: 'Asia/Almaty',
      },
    });

    expect(result).toBe(false);
  });

  it('does not apply quiet hours when disabled', () => {
    const result = isWithinQuietHours({
      datetime: '2026-05-21T21:30:00Z',
      quietHours: {
        userId: 'user-1',
        enabled: false,
        start: '22:00',
        end: '08:00',
        timezone: 'Asia/Almaty',
      },
    });

    expect(result).toBe(false);
  });

  it('applies quiet hours to marketing push', () => {
    expect(
      shouldApplyQuietHours({
        notificationType: 'marketing',
        channel: 'push',
      }),
    ).toBe(true);
  });

  it('does not apply quiet hours to transactional push', () => {
    expect(
      shouldApplyQuietHours({
        notificationType: 'transactional',
        channel: 'push',
      }),
    ).toBe(false);
  });
});