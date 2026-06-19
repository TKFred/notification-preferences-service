import { DataSource } from 'typeorm';
import { UserPreferenceModel } from '../models/userPreferenceModel';
import { UserQuietHoursModel } from '../models/userQuietHoursModel';
import { Preference } from '../../domain/entities/preference';
import { QuietHours } from '../../domain/entities/quietHours';
import { toPreferenceEntity } from '../adapters/preferenceModelAdapter';
import { toQuietHoursEntity } from '../adapters/quietHoursModelAdapter';

export class PreferencesRepository {
  constructor(private readonly dataSource: DataSource) {}

  async findUserPreferences(userId: string): Promise<Preference[]> {
    const models = await this.dataSource
      .getRepository(UserPreferenceModel)
      .find({ where: { userId } });

    return models.map(toPreferenceEntity);
  }

  async findQuietHours(userId: string): Promise<QuietHours | null> {
    const model = await this.dataSource
      .getRepository(UserQuietHoursModel)
      .findOne({ where: { userId } });

    return model ? toQuietHoursEntity(model) : null;
  }

  async upsertPreference(preference: Preference): Promise<void> {
    await this.dataSource.getRepository(UserPreferenceModel).upsert(
      {
        userId: preference.userId,
        notificationType: preference.notificationType,
        channel: preference.channel,
        enabled: preference.enabled,
      },
      ['userId', 'notificationType', 'channel'],
    );
  }

  async upsertQuietHours(quietHours: QuietHours): Promise<void> {
    await this.dataSource.getRepository(UserQuietHoursModel).upsert(
      {
        userId: quietHours.userId,
        enabled: quietHours.enabled,
        startTime: quietHours.start,
        endTime: quietHours.end,
        timezone: quietHours.timezone,
      },
      ['userId'],
    );
  }
}