import { Preference } from '../../domain/entities/preference';
import {
  DEFAULT_PREFERENCES,
  DefaultPreference,
} from '../../domain/config/defaultPreferences';
import { QuietHours } from '../../domain/entities/quietHours';

type PreferenceSource = 'default' | 'user';

type PreferenceResponseItem = DefaultPreference & {
  source: PreferenceSource;
};

export function presentUserPreferences(input: {
  userId: string;
  userPreferences: Preference[];
  quietHours: QuietHours | null;
}) {
  const userPreferenceMap = new Map(
    input.userPreferences.map((preference) => [
      `${preference.notificationType}:${preference.channel}`,
      preference,
    ]),
  );

  const preferences: PreferenceResponseItem[] = DEFAULT_PREFERENCES.map(
    (defaultPreference) => {
      const key = `${defaultPreference.notificationType}:${defaultPreference.channel}`;
      const userPreference = userPreferenceMap.get(key);

      if (userPreference) {
        return {
          notificationType: userPreference.notificationType,
          channel: userPreference.channel,
          enabled: userPreference.enabled,
          source: 'user',
        };
      }

      return {
        ...defaultPreference,
        source: 'default',
      };
    },
  );

  return {
    userId: input.userId,
    preferences,
    quietHours: input.quietHours,
  };
}