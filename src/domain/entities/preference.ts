import { Channel, NotificationType } from '../../http/dto/preferences.dto';

export type Preference = {
  userId: string;
  notificationType: NotificationType;
  channel: Channel;
  enabled: boolean;
};