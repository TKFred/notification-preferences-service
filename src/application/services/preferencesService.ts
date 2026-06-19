import { PreferencesRepository } from '../../typeorm/repositories/preferencesRepository';
import { UpdatePreferencesDto } from '../../http/dto/preferences.dto';
import { presentUserPreferences } from '../../http/presenters/preferencesPresenter';

export class PreferencesService {
  constructor(private readonly preferencesRepository: PreferencesRepository) {}

  async getUserPreferences(userId: string) {
    const userPreferences =
      await this.preferencesRepository.findUserPreferences(userId);

    const quietHours = await this.preferencesRepository.findQuietHours(userId);

    return presentUserPreferences({
      userId,
      userPreferences,
      quietHours,
    });
  }

  async updateUserPreferences(userId: string, dto: UpdatePreferencesDto) {
    if (dto.preferences) {
      for (const preference of dto.preferences) {
        await this.preferencesRepository.upsertPreference({
          userId,
          ...preference,
        });
      }
    }

    if (dto.quietHours) {
      await this.preferencesRepository.upsertQuietHours({
        userId,
        ...dto.quietHours,
      });
    }

    return this.getUserPreferences(userId);
  }
}