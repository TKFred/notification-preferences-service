import { Channel, NotificationType } from "../../http/dto/preferences.dto";

export type DefaultPreference = {
  notificationType: NotificationType;
  channel: Channel;
  enabled: boolean;
};

export const DEFAULT_PREFERENCES: DefaultPreference[] = [
  { notificationType: "transactional", channel: "email", enabled: true },
  { notificationType: "transactional", channel: "push", enabled: true },

  { notificationType: "order", channel: "email", enabled: true },
  { notificationType: "order", channel: "push", enabled: true },
  { notificationType: "order", channel: "telegram", enabled: true },
  { notificationType: "order", channel: "sms", enabled: false },

  { notificationType: "delivery", channel: "email", enabled: true },
  { notificationType: "delivery", channel: "push", enabled: true },
  { notificationType: "delivery", channel: "telegram", enabled: true },
  { notificationType: "delivery", channel: "sms", enabled: true },

  { notificationType: "marketing", channel: "email", enabled: false },
  { notificationType: "marketing", channel: "push", enabled: true },
  { notificationType: "marketing", channel: "telegram", enabled: false },
  { notificationType: "marketing", channel: "sms", enabled: false },
];
