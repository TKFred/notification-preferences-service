import { Request } from 'express';
import { EvaluationResult } from '../../application/services/evaluationService';
import { UpdatePreferencesDto } from '../dto/preferences.dto';

export function logPreferencesUpdated(input: {
  req: Request;
  userId: string;
  body: UpdatePreferencesDto;
}) {
  input.req.log.info(
    {
      userId: input.userId,
      preferencesCount: input.body.preferences?.length ?? 0,
      quietHoursUpdated: Boolean(input.body.quietHours),
    },
    'preferences.updated',
  );
}

export function logNotificationEvaluated(input: {
  req: Request;
  body: {
    userId: string;
    notificationType: string;
    channel: string;
    region: string;
  };
  result: EvaluationResult;
}) {
  input.req.log.info(
    {
      userId: input.body.userId,
      notificationType: input.body.notificationType,
      channel: input.body.channel,
      region: input.body.region,
      decision: input.result.decision,
      reason: input.result.reason,
    },
    'notification.evaluated',
  );
}