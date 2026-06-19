import { Preference } from '../../domain/entities/preference';
import { UserPreferenceModel } from '../models/userPreferenceModel';

export function toPreferenceEntity(model: UserPreferenceModel): Preference {
  return {
    userId: model.userId,
    notificationType: model.notificationType as Preference['notificationType'],
    channel: model.channel as Preference['channel'],
    enabled: model.enabled,
  };
}