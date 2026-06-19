import { QuietHours } from '../../domain/entities/quietHours';
import { UserQuietHoursModel } from '../models/userQuietHoursModel';

export function toQuietHoursEntity(model: UserQuietHoursModel): QuietHours {
  return {
    userId: model.userId,
    enabled: model.enabled,
    start: model.startTime,
    end: model.endTime,
    timezone: model.timezone,
  };
}