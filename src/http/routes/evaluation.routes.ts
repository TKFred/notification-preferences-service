import { Router } from 'express';
import { EvaluationService } from '../../application/services/evaluationService';
import { logNotificationEvaluated } from '../logging/requestEventsLogger';
import { EvaluateNotificationDtoSchema } from '../dto/evaluation.dto';
import { asyncHandler } from '../middlewares/asyncHandler';
import { validateBody } from '../middlewares/validateRequest';

export function createEvaluationRouter(evaluationService: EvaluationService) {
  const router = Router();

  router.post(
    '/evaluate',
    validateBody(EvaluateNotificationDtoSchema),
    asyncHandler(async (req, res) => {
      const result = await evaluationService.evaluate(req.body);

      logNotificationEvaluated({
        req,
        body: req.body,
        result,
      });

      res.json(result);
    }),
  );

  return router;
}