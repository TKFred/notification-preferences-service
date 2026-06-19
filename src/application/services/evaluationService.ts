import { EvaluateNotificationDto } from "../../http/dto/evaluation.dto";
import { PreferencesRepository } from "../../typeorm/repositories/preferencesRepository";
import { PoliciesRepository } from "../../typeorm/repositories/policiesRepository";
import { DEFAULT_PREFERENCES } from "../../domain/config/defaultPreferences";
import {
  isWithinQuietHours,
  shouldApplyQuietHours,
} from '../../application/services/quietHoursService';

export type EvaluationResult = {
  decision: "allow" | "deny";
  reason:
    | "blocked_by_global_policy"
    | "allowed_by_user_preference"
    | "disabled_by_user_preference"
    | "allowed_by_default"
    | "disabled_by_default"
    | "no_matching_preference"
    | "blocked_by_quiet_hours";
};

export class EvaluationService {
  constructor(
    private readonly preferencesRepository: PreferencesRepository,
    private readonly policiesRepository: PoliciesRepository,
  ) {}

  async evaluate(input: EvaluateNotificationDto): Promise<EvaluationResult> {
    const globalPolicy = await this.policiesRepository.findBlockingPolicy({
      notificationType: input.notificationType,
      channel: input.channel,
      region: input.region,
    });

    if (globalPolicy) {
      return {
        decision: "deny",
        reason: "blocked_by_global_policy",
      };
    }

    const quietHours = await this.preferencesRepository.findQuietHours(
      input.userId,
    );

    if (
      quietHours &&
      shouldApplyQuietHours({
        notificationType: input.notificationType,
        channel: input.channel,
      }) &&
      isWithinQuietHours({
        datetime: input.datetime,
        quietHours,
      })
    ) {
      return {
        decision: "deny",
        reason: "blocked_by_quiet_hours",
      };
    }

    const userPreferences =
      await this.preferencesRepository.findUserPreferences(input.userId);

    const userPreference = userPreferences.find(
      (preference) =>
        preference.notificationType === input.notificationType &&
        preference.channel === input.channel,
    );

    if (userPreference) {
      return {
        decision: userPreference.enabled ? "allow" : "deny",
        reason: userPreference.enabled
          ? "allowed_by_user_preference"
          : "disabled_by_user_preference",
      };
    }

    const defaultPreference = DEFAULT_PREFERENCES.find(
      (preference) =>
        preference.notificationType === input.notificationType &&
        preference.channel === input.channel,
    );

    if (defaultPreference) {
      return {
        decision: defaultPreference.enabled ? "allow" : "deny",
        reason: defaultPreference.enabled
          ? "allowed_by_default"
          : "disabled_by_default",
      };
    }

    return {
      decision: "deny",
      reason: "no_matching_preference",
    };
  }
}
