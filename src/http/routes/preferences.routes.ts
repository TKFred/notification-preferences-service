import { Router } from 'express';
import { PreferencesService } from '../../application/services/preferencesService';
import { getUserIdParam } from '../../helpers/http.helpers';
import { logPreferencesUpdated } from '../logging/requestEventsLogger';
import { UpdatePreferencesDtoSchema } from '../dto/preferences.dto';
import { asyncHandler } from '../middlewares/asyncHandler';
import { validateBody } from '../middlewares/validateRequest';

export function createPreferencesRouter(
  preferencesService: PreferencesService,
) {
  const router = Router();

  router.get(
    '/users/:userId/preferences',
    asyncHandler(async (req, res) => {
      const userId = getUserIdParam(req.params.userId);

      const result = await preferencesService.getUserPreferences(userId);

      res.json(result);
    }),
  );

  router.post(
    '/users/:userId/preferences',
    validateBody(UpdatePreferencesDtoSchema),
    asyncHandler(async (req, res) => {
      const userId = getUserIdParam(req.params.userId);

      const result = await preferencesService.updateUserPreferences(
        userId,
        req.body,
      );

      logPreferencesUpdated({
        req,
        userId,
        body: req.body,
      });

      res.json(result);
    }),
  );

  return router;
}