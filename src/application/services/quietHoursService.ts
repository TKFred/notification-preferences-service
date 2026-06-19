import { DateTime } from 'luxon';
import { Channel, NotificationType } from '../../http/dto/preferences.dto';
import { QuietHours } from '../../domain/entities/quietHours';

export function shouldApplyQuietHours(input: {
  notificationType: NotificationType;
  channel: Channel;
}): boolean {
  return (
    input.notificationType === 'marketing' &&
    ['push', 'sms', 'telegram'].includes(input.channel)
  );
}

export function isWithinQuietHours(input: {
  datetime: string;
  quietHours: QuietHours;
}): boolean {
  const { datetime, quietHours } = input;

  if (!quietHours.enabled) {
    return false;
  }

  const localDateTime = DateTime.fromISO(datetime, { zone: 'utc' }).setZone(
    quietHours.timezone,
  );

  const currentMinutes = localDateTime.hour * 60 + localDateTime.minute;
  const startMinutes = toMinutes(quietHours.start);
  const endMinutes = toMinutes(quietHours.end);

  if (startMinutes === endMinutes) {
    return false;
  }

  if (startMinutes < endMinutes) {
    return currentMinutes >= startMinutes && currentMinutes < endMinutes;
  }

  return currentMinutes >= startMinutes || currentMinutes < endMinutes;
}

function toMinutes(value: string): number {
  const [hours, minutes] = value.split(':').map(Number);
  return hours * 60 + minutes;
}