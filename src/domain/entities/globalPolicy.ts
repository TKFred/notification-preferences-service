import { Channel, NotificationType } from '../../http/dto/preferences.dto';
import { Region } from '../../http/dto/evaluation.dto';

export type GlobalPolicy = {
  id: string;
  notificationType: NotificationType;
  channel: Channel;
  region: Region;
  enabled: boolean;
  reason: string;
};