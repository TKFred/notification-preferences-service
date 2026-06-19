import { GlobalPolicy } from '../../domain/entities/globalPolicy';
import { GlobalPolicyModel } from '../models/globalPolicyModel';

export function toGlobalPolicyEntity(model: GlobalPolicyModel): GlobalPolicy {
  return {
    id: model.id,
    notificationType: model.notificationType as GlobalPolicy['notificationType'],
    channel: model.channel as GlobalPolicy['channel'],
    region: model.region as GlobalPolicy['region'],
    enabled: model.enabled,
    reason: model.reason,
  };
}