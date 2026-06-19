import { z } from "zod";
import { ChannelSchema, NotificationTypeSchema } from "./preferences.dto";

export const RegionSchema = z.enum(["EU", "US", "KZ", "GLOBAL"]);

export const EvaluateNotificationDtoSchema = z.object({
  userId: z.string().min(1),
  notificationType: NotificationTypeSchema,
  channel: ChannelSchema,
  region: RegionSchema,
  datetime: z.string().datetime(),
});

export type EvaluateNotificationDto = z.infer<
  typeof EvaluateNotificationDtoSchema
>;
export type Region = z.infer<typeof RegionSchema>;
