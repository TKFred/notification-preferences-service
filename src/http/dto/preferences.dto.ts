import { z } from 'zod';

export const NotificationTypeSchema = z.enum([
  'marketing',
  'transactional',
  'order',
  'delivery',
]);

export const ChannelSchema = z.enum([
  'email',
  'push',
  'telegram',
  'sms',
]);

export const UpdatePreferencesDtoSchema = z.object({
  preferences: z
    .array(
      z.object({
        notificationType: NotificationTypeSchema,
        channel: ChannelSchema,
        enabled: z.boolean(),
      }),
    )
    .optional(),

  quietHours: z
    .object({
      enabled: z.boolean(),
      start: z.string().regex(/^\d{2}:\d{2}$/),
      end: z.string().regex(/^\d{2}:\d{2}$/),
      timezone: z.string().min(1),
    })
    .optional(),
});

export type UpdatePreferencesDto = z.infer<typeof UpdatePreferencesDtoSchema>;
export type NotificationType = z.infer<typeof NotificationTypeSchema>;
export type Channel = z.infer<typeof ChannelSchema>;